"use client";

import { DISPOSITIONS, DISPOSITION_ORDER } from "@/lib/brand";

/**
 * The Pipeline Board — a static visual of the operator's decision logic: the
 * six stations of the funnel and the dispositions a lead can route to. Replaces
 * the researcher's list-ranker (the operator decides per-lead, it doesn't rank
 * a list into bands). This shows WHERE a lead can be and WHAT can happen to it.
 */

const STATIONS: { n: number; stage: string; rule: string }[] = [
  { n: 1, stage: "new", rule: "Gate & grade. Pass the gate, score 5 signals, route by grade, draft the first touch." },
  { n: 2, stage: "contacted", rule: "Outreach outcome. No answer → voicemail + SMS, retry 48h. Reply → book the qualifier." },
  { n: 3, stage: "qualifier", rule: "Qualify. Proceed / decline / refer on the 5 answers + walk-away flags." },
  { n: 4, stage: "diagnostic", rule: "Diagnose & prescribe. Route to a service pattern, set tier + price, draft the proposal." },
  { n: 5, stage: "proposal", rule: "Close / recover. Accepted → kickoff. Objection → counter. Silence → two follow-ups, then lost." },
  { n: 6, stage: "won", rule: "Signed. Draft the kickoff + first invoice per the tier's milestones." },
];

export function PipelineBoard() {
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
      {/* The six stations */}
      <div className="panel p-4">
        <div className="eyebrow mb-3">The pipeline · six decision stations</div>
        <div className="space-y-2">
          {STATIONS.map((s, i) => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className="font-mono font-semibold text-[0.7rem] w-6 h-6 flex items-center justify-center rounded-full border border-line-strong text-ink bg-sunken tabular-nums">
                  {s.n}
                </span>
                {i < STATIONS.length - 1 && <span className="w-px flex-1 min-h-[14px] bg-line-strong my-0.5" />}
              </div>
              <div className="pb-2 min-w-0">
                <span className="field-chip">{`stage: ${s.stage}`}</span>
                <div className="text-[0.8rem] text-muted leading-snug mt-1.5">{s.rule}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-line text-[0.72rem] text-faint font-mono">
          new → contacted → replied → qualifier → diagnostic → proposal → won &nbsp;·&nbsp; lost (off to the side)
        </div>
      </div>

      {/* The dispositions */}
      <div className="panel p-4">
        <div className="eyebrow mb-3">The dispositions · where a lead routes</div>
        <div className="space-y-2">
          {DISPOSITION_ORDER.map((id) => {
            const d = DISPOSITIONS[id];
            return (
              <div
                key={id}
                className="rounded-card border px-3 py-2.5"
                style={{ borderColor: d.hex, background: d.soft }}
              >
                <span className="state-badge" style={{ color: d.hex, borderColor: d.hex, background: "#fff" }}>
                  {d.label}
                </span>
                <div className="text-[0.78rem] text-ink-soft leading-snug mt-1.5">{d.note}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[0.72rem] text-faint leading-snug">
          A lead never leaves the operator&apos;s hands undecided. Every input exits with a
          disposition, a drafted artifact, and a next action + due date.
        </div>
      </div>
    </div>
  );
}
