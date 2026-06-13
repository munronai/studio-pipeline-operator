"use client";

import { useCallback, useRef, useState } from "react";
import type { ModeId } from "@/lib/brand";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Shared streaming client for /api/research. Used by both the chat and the duel.
 * Keeps the fetch/reader/decoder loop in one place so the surfaces stay thin.
 */
export function useResearchStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string, mode: ModeId, history?: ChatMessage[]) => {
      const clean = text.trim();
      if (!clean || isStreaming) return;
      setError(null);

      const base = history ?? messages;
      const userMsg: ChatMessage = { role: "user", content: clean };
      const updated = [...base, userMsg];
      setMessages([...updated, { role: "assistant", content: "" }]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated, mode }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const errBody = await res.json().catch(() => ({ error: "Unknown error" }));
          setError(errBody.error || "Operator API failed");
          setMessages(updated);
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages([...updated, { role: "assistant", content: assistantText }]);
        }
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  return { messages, isStreaming, error, send, reset, setMessages };
}
