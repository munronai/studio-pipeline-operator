"use client";

import { useEffect, useRef, useState } from "react";
import { MODES, DISPOSITIONS, type DispositionId } from "@/lib/brand";
import { usePipeline } from "@/lib/pipeline/store";
import { parseRun, stripTrailingJson } from "@/lib/pipeline/parse-run";
import { STAGE_LABEL } from "@/lib/pipeline/types";
import { Markdown } from "@/components/Markdown";

export type RunOutcome = {
  leadId: string;
  toast: string;
  hex: string;
};

/**
 * The docked "Run a lead" console. Streams the operator live, then parses the
 * trailing JSON (markdown fallback) and routes the lead into the board. Calls
 * `onRouted` with the dropped lead id + a toast string so the parent can
 * highlight the card and surface the toast.
 */
export function RunPanel({ onRouted }: { onRouted: (o: RunOutcome) => void }) {
  const meta = MODES.run;
  const { upsertLeadFromRun } = usePipeline();
  const [input, setInput] = useState(meta.starter);
  const [display, setDisplay] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDispo, setLastDispo] = useState<DispositionId | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const leadTextRef = useRef("");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [display]);

  async function run() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setError(null);
    setDisplay("");
    setLastDispo(null);
    setIsStreaming(true);
    leadTextRef.current = text;

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let full = "";
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }], mode: "run" }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: "Operator API failed" }));
        setError(errBody.error || "Operator API failed");
        setIsStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setDisplay(stripTrailingJson(full));
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setIsStreaming(false);
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
      setIsStreaming(false);
      return;
    }

    setIsStreaming(false);

    // Parse the run + route into the board.
    const parsed = parseRun(full);
    if (!parsed) {
      setError("Couldn't read a disposition from the run. Try a clearer lead.");
      return;
    }
    setLastDispo(parsed.disposition);
    const result = upsertLeadFromRun(parsed, leadTextRef.current);
    if (result) {
      const d = DISPOSITIONS[parsed.disposition];
      const toast = `${result.lead.name} → ${parsed.disposition.toUpperCase()} → ${STAGE_LABEL[result.toStage]}`;
      onRouted({ leadId: result.lead.place_id, toast, hex: d.hex });
    }
  }

  function reset() {
    abortRef.current?.abort();
    setDisplay("");
    setError(null);
    setLastDispo(null);
    setInput(meta.starter);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run();
    }
  }

  return (
    <div className="console flex flex-col overflow-hidden h-full min-h-[420px]">
      <div className="console-head px-3.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="console-dot" style={{ background: "#4f46e5" }} />
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted font-semibold">
            ▸ run a lead → board
          </span>
        </div>
        {lastDispo && (
          <span
            className="state-badge"
            style={{
              color: DISPOSITIONS[lastDispo].hex,
              borderColor: DISPOSITIONS[lastDispo].hex,
              background: "#fff",
            }}
          >
            {DISPOSITIONS[lastDispo].label}
          </span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 bg-paper">
        {display.length === 0 && !isStreaming ? (
          <div className="text-[0.78rem] text-muted leading-relaxed font-sans">
            Paste a lead at any stage. The operator gates it, grades it, decides the disposition, and{" "}
            <span className="text-ink font-medium">drops a card into the right column</span> on the
            board.
          </div>
        ) : (
          <div className="font-mono">
            <Markdown text={display} />
            {isStreaming && display.length === 0 && (
              <span className="inline-flex gap-1 text-indigo">
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
              </span>
            )}
          </div>
        )}
        {error && (
          <div
            className="card p-2.5 text-[0.78rem] font-mono mt-3"
            style={{ borderLeftWidth: 3, borderLeftColor: "#d92d20", color: "#d92d20" }}
          >
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-line p-2.5 bg-sunken">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={meta.placeholder}
          rows={2}
          disabled={isStreaming}
          className="w-full bg-paper border border-line-strong rounded-card px-2.5 py-2 text-[0.8rem] resize-none focus:outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo disabled:opacity-50 font-mono text-ink placeholder:text-faint"
        />
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={reset}
            disabled={isStreaming}
            className="text-[0.66rem] uppercase tracking-wider font-mono text-muted hover:text-ink disabled:opacity-40"
          >
            ↺ Clear
          </button>
          <button
            onClick={run}
            disabled={isStreaming || !input.trim()}
            className="btn-indigo disabled:opacity-30 px-5"
          >
            {isStreaming ? "···" : "Run → board"}
          </button>
        </div>
      </div>
    </div>
  );
}
