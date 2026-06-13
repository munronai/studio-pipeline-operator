"use client";

import { SIGNALS, SIGNAL_ORDER, GRADES } from "@/lib/brand";

/**
 * The 5-signal rubric + grade scale — the operator's domain artifact (replaces
 * the researcher's source tiers). This is how a lead earns a grade, and how a
 * grade routes. Rendered clean and dense, enterprise-CRM style.
 */
export function RubricLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-3">
      {!compact && <div className="eyebrow">The 5-signal rubric · weighted</div>}
      <div className="grid gap-1.5">
        {SIGNAL_ORDER.map((id) => {
          const s = SIGNALS[id];
          return (
            <div
              key={id}
              className="flex items-center gap-2.5 bg-paper border border-line rounded-card px-2.5 py-2"
            >
              <span
                className="font-mono font-semibold text-[0.7rem] shrink-0 w-10 text-right tabular-nums"
                style={{ color: s.hex }}
              >
                {s.weight}%
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-ink text-[0.82rem] leading-tight">{s.label}</div>
                {!compact && (
                  <div className="text-[0.72rem] text-muted leading-snug mt-0.5">{s.reads}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {!compact && <div className="eyebrow mb-1.5">Grade → routing</div>}
        <div className="flex flex-wrap gap-1.5">
          {GRADES.map((g) => (
            <span
              key={g.code}
              className="state-badge"
              style={{ color: g.hex, borderColor: g.hex, background: g.soft }}
              title={`${g.band} — ${g.route}`}
            >
              {g.code}
              <span className="opacity-60 font-normal tabular-nums ml-0.5">{g.band}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
