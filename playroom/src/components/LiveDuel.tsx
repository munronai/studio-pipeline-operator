"use client";

import { useState } from "react";
import { LEAD_SCENARIOS, type LeadScenario, type GenericSegment } from "@/lib/lead-scenarios";
import { useResearchStream } from "@/lib/useResearchStream";
import { Markdown } from "./Markdown";

/**
 * The Live Duel — same lead, two minds:
 *   LEFT  = generic AI (canned response, flaws marked) — $0, instant.
 *   RIGHT = the operator (real, streamed from the folder).
 * The generic column kicks the decision back / dumps options / flatters; the
 * operator column streams the real disposition + drafted artifact.
 */

const FLAW_META: Record<NonNullable<GenericSegment["flaw"]>, { hex: string; soft: string; label: string }> = {
  kickback: { hex: "#c23934", soft: "#f8ecec", label: "Kicks it back — asks you what to do instead of deciding" },
  optionsdump: { hex: "#9a6a14", soft: "#f6f0e3", label: "Dumps options — lists choices instead of routing" },
  flattery: { hex: "#6e6e6e", soft: "#f4f4f4", label: "Flattery — calls every lead 'a great opportunity'" },
  vague: { hex: "#9a9a9a", soft: "#f4f4f4", label: "Vague — no specific decision or number" },
};

const FLAW_ORDER: NonNullable<GenericSegment["flaw"]>[] = ["kickback", "optionsdump", "flattery", "vague"];

export function LiveDuel() {
  const [scenario, setScenario] = useState<LeadScenario>(LEAD_SCENARIOS[0]);
  const [showGeneric, setShowGeneric] = useState(false);
  const { messages, isStreaming, error, send, reset } = useResearchStream();

  const operatorMsg = messages.find((m) => m.role === "assistant");
  const ran = messages.length > 0;

  // Which flaws actually appear in this scenario (for the legend).
  const presentFlaws = FLAW_ORDER.filter((f) => scenario.generic.some((s) => s.flaw === f));

  function run() {
    if (isStreaming) return;
    reset();
    setShowGeneric(true);
    send(scenario.prompt, "duel", []);
  }

  function pick(s: LeadScenario) {
    if (isStreaming) return;
    setScenario(s);
    setShowGeneric(false);
    reset();
  }

  return (
    <div className="space-y-4">
      {/* Scenario picker */}
      <div className="panel p-3.5">
        <div className="eyebrow mb-2">1 · Pick a lead</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {LEAD_SCENARIOS.map((s) => {
            const on = s.id === scenario.id;
            return (
              <button
                key={s.id}
                onClick={() => pick(s)}
                disabled={isStreaming}
                className="text-left px-3 py-2.5 rounded-card border transition-all disabled:opacity-50"
                style={{
                  borderColor: on ? "#0a0a0a" : "#e8e8e8",
                  background: on ? "#fafafa" : "#fff",
                  boxShadow: on ? "0 1px 2px rgba(10,10,10,.05)" : "none",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink text-[0.86rem] leading-tight">{s.business}</span>
                  <span className="field-chip shrink-0 text-[0.62rem]">{s.expected}</span>
                </div>
                <div className="text-[0.7rem] text-muted leading-snug mt-1">{s.segment}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="eyebrow">2 ·</span>
          <button onClick={run} disabled={isStreaming} className="btn-primary disabled:opacity-40">
            {isStreaming ? "Operating…" : ran ? "↻ Run again" : "Run the duel"}
          </button>
          <span className="text-[0.78rem] text-muted">
            Same lead, both columns. Watch what each one does with it.
          </span>
        </div>
      </div>

      {/* The two columns */}
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Generic */}
        <div className="rounded-card border border-line overflow-hidden bg-paper shadow-sm">
          <div className="px-4 py-2.5 bg-sunken border-b border-line flex items-center justify-between">
            <span className="font-mono font-semibold text-[0.72rem] uppercase tracking-wider text-muted">
              Generic AI
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-faint">
              Defers · dumps options
            </span>
          </div>
          <div className="p-4 text-ink min-h-[320px]">
            {showGeneric ? (
              <div className="space-y-4">
                <GenericResponse segments={scenario.generic} />
                <div className="border-t border-line pt-3 space-y-1.5">
                  {presentFlaws.map((f) => (
                    <FlawTag key={f} hex={FLAW_META[f].hex} label={FLAW_META[f].label} />
                  ))}
                </div>
              </div>
            ) : (
              <Placeholder text="A friendly paragraph that calls the lead 'a great opportunity,' lists a few things you could try, and asks what you want to do. Hit run." />
            )}
          </div>
        </div>

        {/* Operator */}
        <div className="rounded-card border overflow-hidden bg-paper shadow-md" style={{ borderColor: "#0a0a0a" }}>
          <div className="px-4 py-2.5 bg-ink border-b flex items-center justify-between" style={{ borderColor: "#0a0a0a" }}>
            <span className="font-mono font-semibold text-[0.72rem] uppercase tracking-wider text-white">
              ▸ The Operator
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-white/60">
              Decides · drafts · routes
            </span>
          </div>
          <div className="console-body p-4 text-ink min-h-[320px] max-h-[64vh] overflow-y-auto font-mono">
            {!ran ? (
              <Placeholder text="It gates the lead, grades it on five signals, commits to a disposition, and drafts the artifact — the call script, the email, or the decline. Ready to send. Hit run." />
            ) : (
              <>
                {operatorMsg && operatorMsg.content.length > 0 && (
                  <Markdown text={operatorMsg.content} />
                )}
                {isStreaming && (!operatorMsg || operatorMsg.content.length === 0) && (
                  <span className="inline-flex gap-1 text-accent">
                    <span className="typing-dot">·</span>
                    <span className="typing-dot">·</span>
                    <span className="typing-dot">·</span>
                  </span>
                )}
                {error && <div className="text-[0.82rem] font-mono text-decline mt-2">{error}</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericResponse({ segments }: { segments: GenericSegment[] }) {
  return (
    <p className="text-[0.9rem] leading-relaxed text-ink-soft text-left">
      {segments.map((s, i) => {
        if (!s.flaw) return <span key={i}>{s.text}</span>;
        const meta = FLAW_META[s.flaw];
        return (
          <span
            key={i}
            className="rounded px-0.5"
            style={{
              background: meta.soft,
              borderBottom: `1.5px ${s.flaw === "flattery" || s.flaw === "vague" ? "dashed" : "solid"} ${meta.hex}`,
            }}
          >
            {s.text}
          </span>
        );
      })}
    </p>
  );
}

function FlawTag({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.72rem]">
      <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: `${hex}22`, border: `1.5px solid ${hex}` }} />
      <span style={{ color: hex }}>{label}</span>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center text-center min-h-[280px]">
      <p className="text-[0.85rem] text-faint max-w-xs leading-relaxed font-sans">{text}</p>
    </div>
  );
}
