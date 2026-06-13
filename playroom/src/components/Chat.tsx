"use client";

import { useEffect, useRef, useState } from "react";
import { MODES, type ModeId } from "@/lib/brand";
import { useResearchStream } from "@/lib/useResearchStream";
import { Markdown } from "./Markdown";
import { RubricLegend } from "./RubricLegend";

/**
 * The Run-a-lead console. Paste a lead at any stage; the operator gates it,
 * grades it, decides the disposition, and drafts the next action — streamed
 * live from the folder.
 */
export function Chat() {
  const mode: ModeId = "run";
  const meta = MODES[mode];
  const { messages, isStreaming, error, send, reset } = useResearchStream();
  const [input, setInput] = useState(meta.starter);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function submit() {
    if (!input.trim() || isStreaming) return;
    send(input, mode);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      {/* Main column — the console */}
      <div className="console flex flex-col overflow-hidden" style={{ height: "min(72vh, 640px)" }}>
        {/* Console head */}
        <div className="console-head px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="console-dot" style={{ background: "#1a7f4b" }} />
            <span className="font-mono text-[0.72rem] uppercase tracking-wider text-muted font-semibold">
              ▸ operator · run-a-lead
            </span>
          </div>
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-faint">
            decide · draft · route
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-paper">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
              />
            ))
          )}
          {error && (
            <div
              className="card p-3 text-[0.82rem] font-mono"
              style={{ borderLeftWidth: 3, borderLeftColor: "#c23934", color: "#c23934" }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-line p-3 bg-sunken">
          <div className="flex gap-2 items-stretch">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={meta.placeholder}
              rows={2}
              disabled={isStreaming}
              className="flex-1 bg-paper border border-line-strong rounded-card px-3 py-2 text-[0.85rem] resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent disabled:opacity-50 font-mono text-ink placeholder:text-faint"
            />
            <button
              onClick={submit}
              disabled={isStreaming || !input.trim()}
              className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed self-stretch px-5"
            >
              {isStreaming ? "···" : "Run"}
            </button>
          </div>
          {messages.length > 0 && (
            <button
              onClick={reset}
              disabled={isStreaming}
              className="mt-2 text-[0.7rem] uppercase tracking-wider font-mono text-muted hover:text-ink disabled:opacity-40"
            >
              ↺ New lead
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-3">
        <div className="panel p-3.5">
          <div className="eyebrow mb-1.5">How it routes</div>
          <div className="text-[0.78rem] text-muted leading-snug">{meta.blurb}</div>
        </div>
        <div className="panel p-3.5">
          <RubricLegend compact />
          <div className="text-[0.7rem] text-faint mt-3 leading-snug">
            Every lead gets gated, then scored on these five signals. The grade decides the route —
            call, queue, or nurture.
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming: boolean;
}) {
  const isOperator = role === "assistant";
  return (
    <div className={`flex ${isOperator ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[90%] rounded-card px-4 py-3 border"
        style={
          isOperator
            ? { background: "#fff", borderColor: "#0a0a0a", boxShadow: "0 1px 2px rgba(10,10,10,.05)" }
            : { background: "#f4f4f4", borderColor: "#e8e8e8" }
        }
      >
        <div
          className="text-[0.6rem] uppercase tracking-[0.16em] mb-1.5 font-mono font-semibold"
          style={{ color: isOperator ? "#0a0a0a" : "#6e6e6e" }}
        >
          {isOperator ? "▸ Operator" : "You"}
        </div>
        {isOperator ? (
          <div className="font-mono">
            <Markdown text={content} />
            {streaming && content.length === 0 && (
              <span className="inline-flex gap-1 text-accent">
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
              </span>
            )}
          </div>
        ) : (
          <div className="text-[0.85rem] whitespace-pre-wrap leading-relaxed text-ink-soft font-sans">{content}</div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const meta = MODES.run;
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 font-sans">
      <div className="text-3xl mb-3 text-ink">▸</div>
      <div className="display-tagline text-2xl mb-1 text-ink">Run a lead.</div>
      <div className="eyebrow mb-4">{meta.subtitle}</div>
      <p className="text-[0.85rem] text-muted max-w-sm leading-relaxed">{meta.blurb}</p>
      <div className="text-[0.7rem] text-muted mt-6 max-w-sm font-mono tracking-wider uppercase border border-line rounded-card px-4 py-2 bg-sunken">
        Paste a lead. Expect a disposition, not options.
      </div>
    </div>
  );
}
