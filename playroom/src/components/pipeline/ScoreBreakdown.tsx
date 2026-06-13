"use client";

import { SIGNALS, SIGNAL_ORDER, type SignalId } from "@/lib/brand";
import type { Lead } from "@/lib/pipeline/types";
import { GradeBadge } from "./Badges";

/** The 5-signal score breakdown — one bar per dimension, weight + evidence. */
export function ScoreBreakdown({ lead }: { lead: Lead }) {
  const dims: { id: SignalId; value: number | null }[] = [
    { id: "need", value: lead.need_score },
    { id: "fit", value: lead.fit_dim_score },
    { id: "reach", value: lead.reach_score },
    { id: "pay", value: lead.pay_score },
    { id: "intent", value: lead.intent_score },
  ];
  const ordered = SIGNAL_ORDER.map((id) => dims.find((d) => d.id === id)!);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="eyebrow-xs">Score breakdown</div>
        <div className="flex items-center gap-2">
          <GradeBadge grade={lead.grade} fitScore={lead.fit_score} />
        </div>
      </div>

      <div className="space-y-2.5">
        {ordered.map(({ id, value }) => {
          const meta = SIGNALS[id];
          const pct = value != null ? (value / 10) * 100 : 0;
          const strong = (value ?? 0) >= 7;
          const fill = strong ? "#4f46e5" : "#1a1a1f";
          const evidence = lead.score_evidence?.[id] ?? "";
          return (
            <div key={id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.78rem] font-medium text-ink">{meta.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[0.62rem] font-mono text-faint">{meta.weight}%</span>
                  <span className="mono-num text-[0.74rem] font-semibold text-ink w-8 text-right">
                    {value != null ? `${value}/10` : "—"}
                  </span>
                </span>
              </div>
              <div className="score-track mt-1">
                <div className="score-fill" style={{ width: `${pct}%`, background: fill }} />
              </div>
              {evidence && (
                <div className="text-[0.68rem] text-muted leading-snug mt-1">{evidence}</div>
              )}
            </div>
          );
        })}
      </div>

      {lead.modifiers && (
        <div className="mt-2.5 text-[0.7rem] text-critical leading-snug border-l-2 border-critical pl-2 py-0.5">
          {lead.modifiers}
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between">
        <span className="eyebrow-xs">Composite</span>
        <span className="mono-num text-[0.8rem] font-semibold text-ink">
          {lead.grade ?? "—"}
          {lead.fit_score != null && (
            <span className="text-muted font-normal ml-1.5">{lead.fit_score}/100</span>
          )}
        </span>
      </div>
    </div>
  );
}
