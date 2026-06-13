/**
 * Pipeline domain model — the subset of the studio's real Lead CRM that the
 * demo needs. Everything the Kanban, the lead drawer, and the operator-routing
 * read/write is typed here. Mirrors the CRM's canonical taxonomy exactly.
 */

import type { DispositionId, SignalId } from "@/lib/brand";

/* ---------------- STAGES ---------------- */

export type Stage =
  | "new"
  | "contacted"
  | "replied"
  | "qualifier"
  | "diagnostic"
  | "proposal"
  | "won"
  | "lost";

/** Funnel order (excludes lost, which sits off the funnel). */
export const FUNNEL_STAGES: Stage[] = [
  "new",
  "contacted",
  "replied",
  "qualifier",
  "diagnostic",
  "proposal",
  "won",
];

/** Board column order — the 7 funnel stages + lost. */
export const BOARD_STAGES: Stage[] = [...FUNNEL_STAGES, "lost"];

/** Active-work stages (the open opportunities). */
export const OPEN_STAGES: Stage[] = [
  "contacted",
  "replied",
  "qualifier",
  "diagnostic",
  "proposal",
];

export const STAGE_LABEL: Record<Stage, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  qualifier: "Qualifier",
  diagnostic: "Diagnostic",
  proposal: "Proposal",
  won: "Won / Signed",
  lost: "Lost",
};

/** Stage accent — won is green, lost is gray, everything else ink. */
export const STAGE_HEX: Record<Stage, string> = {
  new: "#1a1a1f",
  contacted: "#1a1a1f",
  replied: "#1a1a1f",
  qualifier: "#1a1a1f",
  diagnostic: "#1a1a1f",
  proposal: "#1a1a1f",
  won: "#0f9d58",
  lost: "#9a9a93",
};

/** Next funnel stage for an ADVANCE. `won` is terminal (stays won). */
export function nextStage(stage: Stage): Stage {
  const i = FUNNEL_STAGES.indexOf(stage);
  if (i === -1) return "contacted"; // from lost → re-enter at contacted
  if (i >= FUNNEL_STAGES.length - 1) return "won";
  return FUNNEL_STAGES[i + 1];
}

/* ---------------- GRADES ---------------- */

export type Grade = "A+" | "A" | "B" | "C" | "D" | null;

export function gradeForScore(fit: number | null): Grade {
  if (fit === null) return null;
  if (fit >= 90) return "A+";
  if (fit >= 80) return "A";
  if (fit >= 65) return "B";
  if (fit >= 50) return "C";
  return "D";
}

/** Grade badge fill: A+/A indigo, B signal blue, C warning gold, D faint gray. */
export function gradeHex(grade: Grade): { fg: string; bg: string; border: string } {
  switch (grade) {
    case "A+":
    case "A":
      return { fg: "#ffffff", bg: "#4f46e5", border: "#4f46e5" };
    case "B":
      return { fg: "#ffffff", bg: "#2f6df6", border: "#2f6df6" };
    case "C":
      return { fg: "#ffffff", bg: "#b7791f", border: "#b7791f" };
    case "D":
      return { fg: "#ffffff", bg: "#9a9a93", border: "#9a9a93" };
    default:
      return { fg: "#6e6e6e", bg: "#f4f4f6", border: "#d3d3da" };
  }
}

/* ---------------- DISPOSITIONS ---------------- */

/** Decline-reason taxonomy (for lost leads). */
export type DeclineReason =
  | "budget-floor"
  | "timeline"
  | "scope-mismatch"
  | "not-a-fit"
  | "vendor-mode"
  | "no-decision-maker"
  | "competitor-chosen"
  | "bad-timing"
  | "ghosted"
  | "studio-declined"
  | "referred-elsewhere"
  | "gate-fail";

export const DECLINE_REASONS: DeclineReason[] = [
  "budget-floor",
  "timeline",
  "scope-mismatch",
  "not-a-fit",
  "vendor-mode",
  "no-decision-maker",
  "competitor-chosen",
  "bad-timing",
  "ghosted",
  "studio-declined",
  "referred-elsewhere",
  "gate-fail",
];

/**
 * Route a disposition from a lead's current stage.
 * Returns the target stage + optional decline_reason.
 */
export function routeDisposition(
  current: Stage,
  disposition: DispositionId
): { stage: Stage; decline_reason: DeclineReason | null } {
  switch (disposition) {
    case "advance":
      return { stage: nextStage(current), decline_reason: null };
    case "escalate":
      return { stage: "diagnostic", decline_reason: null };
    case "refer":
      return { stage: "lost", decline_reason: "referred-elsewhere" };
    case "decline":
      return { stage: "lost", decline_reason: "studio-declined" };
    case "kill":
      return { stage: "lost", decline_reason: "gate-fail" };
    default:
      return { stage: current, decline_reason: null };
  }
}

/* ---------------- ACTIVITY ---------------- */

export type ActivityChannel =
  | "call"
  | "sms"
  | "email"
  | "linkedin"
  | "walk-in"
  | "referral"
  | "note"
  | "system";

export type ActivityDirection = "out" | "in";

export type Activity = {
  id: string;
  channel: ActivityChannel;
  direction: ActivityDirection;
  outcome: string | null;
  notes: string | null;
  created_at: string; // ISO
};

/* ---------------- APPOINTMENT ---------------- */

export type ApptStatus = "booked" | "no_show" | "done" | "cancelled" | null;

/* ---------------- SCORE EVIDENCE ---------------- */

export type ScoreEvidence = Record<SignalId, string>;

/* ---------------- LEAD ---------------- */

export type Lead = {
  place_id: string;
  name: string;
  category: string;
  owner_name: string | null;
  owner_role: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  platform: string | null; // null/"none" => "No site" badge

  pain_signals: string[];
  description: string;
  selling: string; // what we're selling
  opener: string;

  grade: Grade;
  fit_score: number | null; // 0–100 composite
  need_score: number | null; // 0–10
  fit_dim_score: number | null; // 0–10 (ICP fit dimension)
  reach_score: number | null; // 0–10
  pay_score: number | null; // 0–10
  intent_score: number | null; // 0–10
  score_evidence: ScoreEvidence;
  modifiers: string | null;

  stage: Stage;
  deal_value: number | null;
  next_action: string | null;
  next_action_due: string | null; // ISO date

  appointment_at: string | null; // ISO
  appointment_status: ApptStatus;
  meeting_url: string | null;
  demo_url: string | null;

  decline_reason: DeclineReason | string | null;
  updated_at: string; // ISO
  discovered_at: string; // ISO

  activities: Activity[];
};

/** The trailing-JSON contract the operator emits in "run" mode. */
export type RunDisposition = {
  disposition: DispositionId;
  grade?: string | null;
  fit_score?: number | null;
  scores?: Partial<Record<SignalId, number>>;
  score_evidence?: Partial<ScoreEvidence>;
  stage_hint?: Stage | string | null;
  next_action?: string | null;
  next_action_due?: string | null;
  channel?: ActivityChannel | string | null;
  artifact_type?: string | null;
  flags?: string[];
  deal_value?: number | null;
};
