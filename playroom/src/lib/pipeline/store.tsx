"use client";

/**
 * Pipeline store — a React context holding all leads, persisted to localStorage.
 * Pure client state; no backend. This is the single source of truth the Kanban,
 * the lead drawer, the dialer, the email composer, and the operator-routing all
 * read and write.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DispositionId } from "@/lib/brand";
import {
  type Activity,
  type ApptStatus,
  type Lead,
  type RunDisposition,
  type Stage,
  gradeForScore,
  routeDisposition,
} from "./types";
import { buildSeed } from "./seed";

const STORAGE_KEY = "operator-pipeline-v1";

/* ---------------- helpers ---------------- */

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage(): Lead[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Lead[];
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    /* quota / disabled storage — demo still works in-memory */
  }
}

/* ---------------- context ---------------- */

export type MoveOpts = {
  deal_value?: number | null;
  decline_reason?: string | null;
  next_action?: string | null;
  next_action_due?: string | null;
  logActivity?: boolean;
};

export type RunRouteResult = {
  lead: Lead;
  created: boolean;
  fromStage: Stage;
  toStage: Stage;
  disposition: DispositionId;
};

type PipelineContextValue = {
  leads: Lead[];
  hydrated: boolean;
  getLead: (id: string) => Lead | undefined;
  moveStage: (id: string, stage: Stage, opts?: MoveOpts) => void;
  applyDisposition: (id: string, disposition: DispositionId, patch?: Partial<Lead>) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  addActivity: (id: string, activity: Omit<Activity, "id" | "created_at"> & Partial<Pick<Activity, "id" | "created_at">>) => void;
  setAppointment: (id: string, at: string | null) => void;
  setApptStatus: (id: string, status: ApptStatus) => void;
  upsertLeadFromRun: (payload: RunDisposition, leadText: string) => RunRouteResult | null;
  resetDemo: () => void;
};

const PipelineContext = createContext<PipelineContextValue | null>(null);

/* ---------------- provider ---------------- */

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstSave = useRef(true);

  // Hydrate from localStorage on mount (client only) — falls back to seed.
  useEffect(() => {
    const stored = loadFromStorage();
    setLeads(stored ?? buildSeed());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveToStorage(leads);
  }, [leads, hydrated]);

  const getLead = useCallback(
    (id: string) => leads.find((l) => l.place_id === id),
    [leads]
  );

  const patchLead = useCallback((id: string, fn: (l: Lead) => Lead) => {
    setLeads((prev) => prev.map((l) => (l.place_id === id ? fn(l) : l)));
  }, []);

  const updateLead = useCallback(
    (id: string, patch: Partial<Lead>) => {
      patchLead(id, (l) => {
        const merged = { ...l, ...patch, updated_at: nowIso() };
        // Keep grade in sync if fit_score changed but grade wasn't explicitly set.
        if (patch.fit_score !== undefined && patch.grade === undefined) {
          merged.grade = gradeForScore(merged.fit_score);
        }
        return merged;
      });
    },
    [patchLead]
  );

  const addActivity = useCallback(
    (
      id: string,
      activity: Omit<Activity, "id" | "created_at"> &
        Partial<Pick<Activity, "id" | "created_at">>
    ) => {
      patchLead(id, (l) => {
        const act: Activity = {
          id: activity.id ?? makeId("act"),
          created_at: activity.created_at ?? nowIso(),
          channel: activity.channel,
          direction: activity.direction,
          outcome: activity.outcome ?? null,
          notes: activity.notes ?? null,
        };
        return { ...l, activities: [...l.activities, act], updated_at: nowIso() };
      });
    },
    [patchLead]
  );

  const moveStage = useCallback(
    (id: string, stage: Stage, opts: MoveOpts = {}) => {
      patchLead(id, (l) => {
        const next: Lead = { ...l, stage, updated_at: nowIso() };
        if (opts.deal_value !== undefined) next.deal_value = opts.deal_value;
        if (opts.next_action !== undefined) next.next_action = opts.next_action;
        if (opts.next_action_due !== undefined) next.next_action_due = opts.next_action_due;
        if (stage === "lost") {
          next.decline_reason = opts.decline_reason ?? l.decline_reason ?? null;
        } else {
          next.decline_reason = null;
        }
        if (opts.logActivity !== false && l.stage !== stage) {
          const act: Activity = {
            id: makeId("act"),
            channel: "system",
            direction: "out",
            outcome: "stage-change",
            notes: `Stage: ${l.stage} → ${stage}${
              stage === "lost" && next.decline_reason ? ` (${next.decline_reason})` : ""
            }`,
            created_at: nowIso(),
          };
          next.activities = [...l.activities, act];
        }
        return next;
      });
    },
    [patchLead]
  );

  const applyDisposition = useCallback(
    (id: string, disposition: DispositionId, patch: Partial<Lead> = {}) => {
      patchLead(id, (l) => {
        const route = routeDisposition(l.stage, disposition);
        const merged: Lead = {
          ...l,
          ...patch,
          stage: route.stage,
          decline_reason:
            route.stage === "lost"
              ? (patch.decline_reason as string | null) ?? route.decline_reason
              : null,
          updated_at: nowIso(),
        };
        if (patch.fit_score !== undefined && patch.grade === undefined) {
          merged.grade = gradeForScore(merged.fit_score);
        }
        const act: Activity = {
          id: makeId("act"),
          channel: "system",
          direction: "out",
          outcome: disposition,
          notes: `Operator: ${disposition.toUpperCase()} — ${l.stage} → ${route.stage}.`,
          created_at: nowIso(),
        };
        merged.activities = [...l.activities, act];
        return merged;
      });
    },
    [patchLead]
  );

  const setAppointment = useCallback(
    (id: string, at: string | null) => {
      patchLead(id, (l) => ({
        ...l,
        appointment_at: at,
        appointment_status: at ? (l.appointment_status ?? "booked") : null,
        updated_at: nowIso(),
        activities: at
          ? [
              ...l.activities,
              {
                id: makeId("act"),
                channel: "system" as const,
                direction: "out" as const,
                outcome: "appointment-set",
                notes: `Appointment set for ${new Date(at).toLocaleString()}.`,
                created_at: nowIso(),
              },
            ]
          : l.activities,
      }));
    },
    [patchLead]
  );

  const setApptStatus = useCallback(
    (id: string, status: ApptStatus) => {
      patchLead(id, (l) => ({
        ...l,
        appointment_status: status,
        updated_at: nowIso(),
        activities: [
          ...l.activities,
          {
            id: makeId("act"),
            channel: "system" as const,
            direction: "out" as const,
            outcome: `appt-${status ?? "cleared"}`,
            notes: `Appointment marked: ${status ?? "cleared"}.`,
            created_at: nowIso(),
          },
        ],
      }));
    },
    [patchLead]
  );

  /**
   * Route a completed operator run into the board. If the pasted lead matches an
   * existing lead by name (case-insensitive), update it in place and apply the
   * disposition; otherwise create a new lead in "new" and route it.
   */
  const upsertLeadFromRun = useCallback(
    (payload: RunDisposition, leadText: string): RunRouteResult | null => {
      if (!payload || !payload.disposition) return null;

      const guessedName = guessLeadName(leadText);
      let result: RunRouteResult | null = null;

      setLeads((prev) => {
        // Match an existing lead by name token overlap.
        const existing = guessedName
          ? prev.find((l) => nameMatches(l.name, guessedName))
          : undefined;

        const scorePatch = buildScorePatch(payload);

        if (existing) {
          const fromStage = existing.stage;
          const route = routeDisposition(fromStage, payload.disposition);
          const updated: Lead = {
            ...existing,
            ...scorePatch,
            stage: route.stage,
            deal_value: payload.deal_value ?? existing.deal_value,
            next_action: payload.next_action ?? existing.next_action,
            next_action_due: payload.next_action_due ?? existing.next_action_due,
            decline_reason: route.stage === "lost" ? route.decline_reason : null,
            updated_at: nowIso(),
            activities: [
              ...existing.activities,
              ...runActivities(existing, payload),
            ],
          };
          result = {
            lead: updated,
            created: false,
            fromStage,
            toStage: route.stage,
            disposition: payload.disposition,
          };
          return prev.map((l) => (l.place_id === existing.place_id ? updated : l));
        }

        // Create a new lead in "new", then route it.
        const base = newLeadFromRun(guessedName ?? "New lead", leadText, scorePatch, payload);
        const route = routeDisposition("new", payload.disposition);
        const routed: Lead = {
          ...base,
          stage: route.stage,
          decline_reason: route.stage === "lost" ? route.decline_reason : null,
          activities: [...base.activities, ...runActivities(base, payload)],
        };
        result = {
          lead: routed,
          created: true,
          fromStage: "new",
          toStage: route.stage,
          disposition: payload.disposition,
        };
        return [routed, ...prev];
      });

      return result;
    },
    []
  );

  const resetDemo = useCallback(() => {
    const fresh = buildSeed();
    setLeads(fresh);
    saveToStorage(fresh);
  }, []);

  const value = useMemo<PipelineContextValue>(
    () => ({
      leads,
      hydrated,
      getLead,
      moveStage,
      applyDisposition,
      updateLead,
      addActivity,
      setAppointment,
      setApptStatus,
      upsertLeadFromRun,
      resetDemo,
    }),
    [
      leads,
      hydrated,
      getLead,
      moveStage,
      applyDisposition,
      updateLead,
      addActivity,
      setAppointment,
      setApptStatus,
      upsertLeadFromRun,
      resetDemo,
    ]
  );

  return <PipelineContext.Provider value={value}>{children}</PipelineContext.Provider>;
}

export function usePipeline(): PipelineContextValue {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used within a PipelineProvider");
  return ctx;
}

/* ---------------- run-routing helpers ---------------- */

function buildScorePatch(payload: RunDisposition): Partial<Lead> {
  const patch: Partial<Lead> = {};
  const s = payload.scores ?? {};
  if (s.need !== undefined) patch.need_score = clamp10(s.need);
  if (s.fit !== undefined) patch.fit_dim_score = clamp10(s.fit);
  if (s.reach !== undefined) patch.reach_score = clamp10(s.reach);
  if (s.pay !== undefined) patch.pay_score = clamp10(s.pay);
  if (s.intent !== undefined) patch.intent_score = clamp10(s.intent);

  if (payload.fit_score !== undefined && payload.fit_score !== null) {
    patch.fit_score = clamp100(payload.fit_score);
    patch.grade = gradeForScore(patch.fit_score);
  }
  if (payload.grade) patch.grade = normalizeGrade(payload.grade);

  if (payload.score_evidence) {
    patch.score_evidence = {
      need: payload.score_evidence.need ?? "",
      fit: payload.score_evidence.fit ?? "",
      reach: payload.score_evidence.reach ?? "",
      pay: payload.score_evidence.pay ?? "",
      intent: payload.score_evidence.intent ?? "",
    };
  }
  return patch;
}

function runActivities(lead: Lead, payload: RunDisposition): Activity[] {
  const acts: Activity[] = [];
  const channel = (payload.channel as Activity["channel"]) ?? "system";
  // The drafted artifact, attached as an activity.
  if (payload.artifact_type) {
    acts.push({
      id: makeId("act"),
      channel: isChannel(channel) ? channel : "note",
      direction: "out",
      outcome: "drafted",
      notes: `Operator drafted: ${payload.artifact_type}.`,
      created_at: nowIso(),
    });
  }
  return acts;
}

function newLeadFromRun(
  name: string,
  text: string,
  scorePatch: Partial<Lead>,
  payload: RunDisposition
): Lead {
  return {
    place_id: makeId("ld"),
    name,
    category: "From operator run",
    owner_name: null,
    owner_role: null,
    phone: null,
    email: null,
    website: null,
    address: null,
    rating: null,
    review_count: null,
    platform: null,
    pain_signals: [],
    description: text.slice(0, 400),
    selling: "",
    opener: "",
    grade: scorePatch.grade ?? null,
    fit_score: scorePatch.fit_score ?? null,
    need_score: scorePatch.need_score ?? null,
    fit_dim_score: scorePatch.fit_dim_score ?? null,
    reach_score: scorePatch.reach_score ?? null,
    pay_score: scorePatch.pay_score ?? null,
    intent_score: scorePatch.intent_score ?? null,
    score_evidence: scorePatch.score_evidence ?? { need: "", fit: "", reach: "", pay: "", intent: "" },
    modifiers: payload.flags && payload.flags.length ? payload.flags.join(" · ") : null,
    stage: "new",
    deal_value: payload.deal_value ?? null,
    next_action: payload.next_action ?? null,
    next_action_due: payload.next_action_due ?? null,
    appointment_at: null,
    appointment_status: null,
    meeting_url: null,
    demo_url: null,
    decline_reason: null,
    updated_at: nowIso(),
    discovered_at: nowIso(),
    activities: [
      {
        id: makeId("act"),
        channel: "system",
        direction: "out",
        outcome: "graded",
        notes: "Created from an operator run.",
        created_at: nowIso(),
      },
    ],
  };
}

/* ---------------- small utils ---------------- */

function clamp10(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n)));
}
function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeGrade(g: string): Lead["grade"] {
  const up = g.trim().toUpperCase();
  if (["A+", "A", "B", "C", "D"].includes(up)) return up as Lead["grade"];
  // strip trailing +/- on B+/C- etc. → base letter
  const base = up[0];
  if (["A", "B", "C", "D"].includes(base)) return base as Lead["grade"];
  return null;
}

function isChannel(c: string): c is Activity["channel"] {
  return ["call", "sms", "email", "linkedin", "walk-in", "referral", "note", "system"].includes(c);
}

/** Pull a plausible business name from the pasted lead text. */
export function guessLeadName(text: string): string | null {
  if (!text) return null;
  // Strip common lead-in phrases.
  const cleaned = text
    .replace(/^\s*(new lead|lead|a lead|an inbound lead|new lead came in[^:]*)[:,-]?\s*/i, "")
    .replace(/^\s*["']/, "")
    .trim();
  // Take the first chunk up to a separator.
  const head = cleaned.split(/[.\n—–\-•]|,\s/)[0]?.trim() ?? "";
  // Keep it to a sane name length.
  if (head.length >= 2 && head.length <= 60) return head;
  if (cleaned.length >= 2) return cleaned.slice(0, 48).trim();
  return null;
}

/** Loose name match: significant token overlap, case-insensitive. */
function nameMatches(existing: string, guessed: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w));
  const a = new Set(norm(existing));
  const b = norm(guessed);
  if (b.length === 0) return false;
  const hits = b.filter((w) => a.has(w)).length;
  return hits >= 1 && hits / b.length >= 0.5;
}

const STOP = new Set(["the", "inc", "llc", "co", "and", "services", "service", "company"]);
