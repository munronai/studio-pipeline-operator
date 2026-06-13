"use client";

import type { Lead, Stage } from "@/lib/pipeline/types";
import { STAGE_LABEL, STAGE_HEX } from "@/lib/pipeline/types";
import { money } from "@/lib/pipeline/format";
import { LeadCard } from "./LeadCard";

/** One Kanban column for a stage. Header shows count, value, A-tier, heat bar. */
export function Column({
  stage,
  leads,
  maxCount,
  justDroppedId,
  onOpen,
}: {
  stage: Stage;
  leads: Lead[];
  maxCount: number;
  justDroppedId: string | null;
  onOpen: (id: string) => void;
}) {
  const count = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.deal_value ?? 0), 0);
  const aTier = leads.filter((l) => l.grade === "A" || l.grade === "A+").length;

  // Sort fit_score desc (nulls last).
  const sorted = [...leads].sort((a, b) => (b.fit_score ?? -1) - (a.fit_score ?? -1));

  const heatPct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  const heatColor =
    stage === "won" ? "#0f9d58" : stage === "lost" ? "#9a9a93" : "#1a1a1f";
  const accent = STAGE_HEX[stage];

  return (
    <div className="flex flex-col w-[244px] shrink-0">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg pb-2">
        <div className="bg-paper border border-line rounded-card px-2.5 py-2 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: accent }}
              />
              <span className="font-semibold text-ink text-[0.78rem] tracking-tightish truncate">
                {STAGE_LABEL[stage]}
              </span>
            </div>
            <span className="mono-num font-bold text-ink text-[0.82rem]">{count}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="mono-num text-[0.68rem] text-muted">{money(totalValue)}</span>
            {aTier > 0 && (
              <span className="text-[0.6rem] font-mono font-semibold uppercase tracking-wide text-indigo">
                {aTier} A-tier
              </span>
            )}
          </div>
          {/* Heat bar */}
          <div className="heat-track mt-1.5">
            <div className="heat-fill" style={{ width: `${heatPct}%`, background: heatColor }} />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 pb-4 min-h-[80px]">
        {sorted.length === 0 ? (
          <div className="text-[0.7rem] text-faint text-center py-6 border border-dashed border-line rounded-card">
            No leads
          </div>
        ) : (
          sorted.map((l) => (
            <LeadCard
              key={l.place_id}
              lead={l}
              justDropped={l.place_id === justDroppedId}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}
