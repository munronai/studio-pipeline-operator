"use client";

import { useMemo, useState } from "react";
import { usePipeline } from "@/lib/pipeline/store";
import { BOARD_STAGES, OPEN_STAGES, type Stage } from "@/lib/pipeline/types";
import { money } from "@/lib/pipeline/format";
import { Column } from "./Column";
import { LeadDetail } from "./LeadDetail";

/**
 * The interactive Kanban board. KPI row + 8 columns (7 funnel stages + lost),
 * horizontal scroll. Clicking a card opens the LeadDetail drawer. The
 * `justDroppedId` prop highlights a card the operator just routed in.
 */
export function Board({ justDroppedId }: { justDroppedId?: string | null }) {
  const { leads, hydrated, resetDemo } = usePipeline();
  const [openId, setOpenId] = useState<string | null>(null);

  const byStage = useMemo(() => {
    const map: Record<Stage, typeof leads> = {
      new: [],
      contacted: [],
      replied: [],
      qualifier: [],
      diagnostic: [],
      proposal: [],
      won: [],
      lost: [],
    };
    for (const l of leads) map[l.stage].push(l);
    return map;
  }, [leads]);

  const maxCount = useMemo(
    () => Math.max(1, ...BOARD_STAGES.map((s) => byStage[s].length)),
    [byStage]
  );

  const kpi = useMemo(() => {
    const openLeads = leads.filter((l) => OPEN_STAGES.includes(l.stage));
    const won = leads.filter((l) => l.stage === "won");
    const booked = leads.filter(
      (l) => l.appointment_at && l.appointment_status === "booked"
    );
    return {
      total: leads.length,
      openCount: openLeads.length,
      openValue: openLeads.reduce((s, l) => s + (l.deal_value ?? 0), 0),
      wonValue: won.reduce((s, l) => s + (l.deal_value ?? 0), 0),
      wonCount: won.length,
      bookedCount: booked.length,
    };
  }, [leads]);

  if (!hydrated) {
    return (
      <div className="panel p-10 text-center text-muted text-[0.85rem]">Loading pipeline…</div>
    );
  }

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        <Kpi label="Total leads" value={String(kpi.total)} />
        <Kpi label="Open opps" value={String(kpi.openCount)} sub="contacted → proposal" />
        <Kpi label="Open value" value={money(kpi.openValue)} mono />
        <Kpi label="Won" value={money(kpi.wonValue)} sub={`${kpi.wonCount} signed`} mono accent="#0f9d58" />
        <Kpi label="Booked" value={String(kpi.bookedCount)} accent="#4f46e5" />
        <div className="ml-auto flex items-center">
          <button
            onClick={() => {
              if (confirm("Reset the demo? This reseeds all leads and clears your changes.")) {
                resetDemo();
                setOpenId(null);
              }
            }}
            className="btn-ghost text-[0.74rem] py-1.5 px-3 whitespace-nowrap"
          >
            ↺ Reset demo
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {BOARD_STAGES.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              leads={byStage[stage]}
              maxCount={maxCount}
              justDroppedId={justDroppedId ?? null}
              onOpen={setOpenId}
            />
          ))}
        </div>
      </div>

      {openId && <LeadDetail leadId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  mono,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  accent?: string;
}) {
  return (
    <div className="bg-paper border border-line rounded-card px-3.5 py-2 shadow-sm min-w-[112px] shrink-0">
      <div className="eyebrow-xs">{label}</div>
      <div
        className={`font-semibold text-[1.15rem] tracking-tighter2 leading-tight mt-0.5 ${mono ? "mono-num" : ""}`}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub && <div className="text-[0.62rem] text-faint">{sub}</div>}
    </div>
  );
}
