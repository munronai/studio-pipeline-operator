/**
 * Parse a completed operator "run" into a RunDisposition.
 *
 * Primary path: a trailing fenced ```json block the operator emits after the
 * human-readable disposition. Fallback path: regex over the markdown
 * (DISPOSITION line + PIPELINE UPDATE stage) when the JSON is missing/malformed.
 */

import type { DispositionId } from "@/lib/brand";
import type { RunDisposition, Stage } from "./types";

const DISPOSITIONS: DispositionId[] = ["advance", "escalate", "refer", "decline", "kill"];
const STAGES: Stage[] = [
  "new",
  "contacted",
  "replied",
  "qualifier",
  "diagnostic",
  "proposal",
  "won",
  "lost",
];

/** Extract the last fenced ```json block and parse it. */
function parseTrailingJson(md: string): RunDisposition | null {
  const fences = [...md.matchAll(/```json\s*([\s\S]*?)```/gi)];
  const block = fences.length ? fences[fences.length - 1][1] : null;
  // Also try a bare trailing {...} object if no fence.
  const candidate = block ?? bareTrailingObject(md);
  if (!candidate) return null;
  try {
    const obj = JSON.parse(candidate.trim());
    return normalize(obj);
  } catch {
    return null;
  }
}

function bareTrailingObject(md: string): string | null {
  const end = md.lastIndexOf("}");
  if (end === -1) return null;
  // Walk back to the matching opening brace.
  let depth = 0;
  for (let i = end; i >= 0; i--) {
    if (md[i] === "}") depth++;
    else if (md[i] === "{") {
      depth--;
      if (depth === 0) {
        const slice = md.slice(i, end + 1);
        if (/"disposition"/.test(slice)) return slice;
        return null;
      }
    }
  }
  return null;
}

function normalize(obj: unknown): RunDisposition | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const dispoRaw = String(o.disposition ?? "").toLowerCase().trim();
  const disposition = DISPOSITIONS.find((d) => dispoRaw.includes(d));
  if (!disposition) return null;

  const out: RunDisposition = { disposition };

  if (typeof o.grade === "string") out.grade = o.grade;
  if (typeof o.fit_score === "number") out.fit_score = o.fit_score;
  if (o.scores && typeof o.scores === "object") out.scores = o.scores as RunDisposition["scores"];
  if (o.score_evidence && typeof o.score_evidence === "object")
    out.score_evidence = o.score_evidence as RunDisposition["score_evidence"];
  if (typeof o.stage_hint === "string") out.stage_hint = o.stage_hint;
  if (typeof o.next_action === "string") out.next_action = o.next_action;
  if (typeof o.next_action_due === "string") out.next_action_due = o.next_action_due;
  if (typeof o.channel === "string") out.channel = o.channel;
  if (typeof o.artifact_type === "string") out.artifact_type = o.artifact_type;
  if (Array.isArray(o.flags)) out.flags = o.flags.map(String);
  if (typeof o.deal_value === "number") out.deal_value = o.deal_value;

  return out;
}

/** Fallback: scrape the DISPOSITION + PIPELINE UPDATE lines from the markdown. */
function parseFromMarkdown(md: string): RunDisposition | null {
  const upper = md.toUpperCase();
  let disposition: DispositionId | undefined;
  // Prefer the disposition near a "DISPOSITION" header.
  const dispoLine = md.match(/DISPOSITION[^\n]*\n?[^\n]*/i)?.[0]?.toUpperCase() ?? upper;
  for (const d of DISPOSITIONS) {
    if (dispoLine.includes(d.toUpperCase())) {
      disposition = d;
      break;
    }
  }
  if (!disposition) {
    for (const d of DISPOSITIONS) {
      if (upper.includes(d.toUpperCase())) {
        disposition = d;
        break;
      }
    }
  }
  if (!disposition) return null;

  const out: RunDisposition = { disposition };

  // fit_score from "(72)" or "grade B (72)".
  const fit = md.match(/\((\d{1,3})\)/);
  if (fit) out.fit_score = Number(fit[1]);

  // grade letter
  const grade = md.match(/\bgrade\s+([A-D][+-]?)/i);
  if (grade) out.grade = grade[1];

  // stage from "stage: contacted" or "PIPELINE UPDATE — stage: Y".
  const stageMatch = md.match(/stage:\s*([a-z]+)/i);
  if (stageMatch) {
    const s = stageMatch[1].toLowerCase();
    if ((STAGES as string[]).includes(s)) out.stage_hint = s as Stage;
  }

  return out;
}

/** Public: parse a run, JSON-first, markdown-fallback. */
export function parseRun(markdown: string): RunDisposition | null {
  return parseTrailingJson(markdown) ?? parseFromMarkdown(markdown);
}

/** Strip the trailing ```json block from display markdown. */
export function stripTrailingJson(md: string): string {
  return md.replace(/```json\s*[\s\S]*?```\s*$/i, "").trimEnd();
}
