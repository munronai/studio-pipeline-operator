"use client";

import { type Grade, type Stage, STAGE_LABEL, STAGE_HEX, gradeHex } from "@/lib/pipeline/types";

/** Grade badge — grade letter + fit_score/100, colored per the Onyx scale. */
export function GradeBadge({
  grade,
  fitScore,
  size = "md",
}: {
  grade: Grade;
  fitScore?: number | null;
  size?: "sm" | "md";
}) {
  const c = gradeHex(grade);
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[0.62rem]" : "px-2 py-0.5 text-[0.7rem]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold tabular-nums ${pad}`}
      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}
      title={grade ? `Grade ${grade}${fitScore != null ? ` · ${fitScore}/100` : ""}` : "Ungraded"}
    >
      <span>{grade ?? "—"}</span>
      {fitScore != null && (
        <span className="opacity-80 font-normal">{fitScore}</span>
      )}
    </span>
  );
}

/** Stage badge — pill with the canonical label + stage accent. */
export function StageBadge({ stage }: { stage: Stage }) {
  const hex = STAGE_HEX[stage];
  const soft = stage === "won" ? "#ecf4ef" : stage === "lost" ? "#f4f4f6" : "#f4f4f6";
  return (
    <span
      className="inline-flex items-center rounded font-mono font-semibold text-[0.66rem] uppercase tracking-wide px-2 py-0.5"
      style={{ color: hex, background: soft, border: `1px solid ${hex}33` }}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}

/** "No site" badge for leads with no platform. */
export function NoSiteBadge() {
  return (
    <span className="inline-flex items-center rounded text-[0.6rem] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 bg-warning/10 text-warning border border-warning/30">
      No site
    </span>
  );
}

export function RatingPip({
  rating,
  reviews,
}: {
  rating: number | null;
  reviews: number | null;
}) {
  if (rating == null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[0.7rem] text-muted mono-num">
      <span className="text-warning">★</span>
      <span className="text-ink-soft font-medium">{rating.toFixed(1)}</span>
      {reviews != null && <span className="text-faint">({reviews})</span>}
    </span>
  );
}
