"use client";

import { useEffect, useRef, useState } from "react";
import type { Lead } from "@/lib/pipeline/types";
import { usePipeline } from "@/lib/pipeline/store";
import { fromInput, toDateTimeInput } from "@/lib/pipeline/format";

type CallState = "connecting" | "ringing" | "connected" | "ended";

const OUTCOMES = [
  "connected",
  "no_answer",
  "voicemail",
  "booked",
  "callback",
  "not_interested",
  "wrong_number",
] as const;

/** Mock soft-phone. Live timer, fake connect progression, outcome logging. */
export function DialerModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { addActivity, setAppointment } = usePipeline();
  const [state, setState] = useState<CallState>("connecting");
  const [seconds, setSeconds] = useState(0);
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number]>("connected");
  const [notes, setNotes] = useState("");
  const [apptAt, setApptAt] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Connect progression: connecting → ringing → connected.
  useEffect(() => {
    const t1 = setTimeout(() => setState("ringing"), 900);
    const t2 = setTimeout(() => setState("connected"), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Live mm:ss timer once connected.
  useEffect(() => {
    if (state === "connected") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  function endCall() {
    if (timerRef.current) clearInterval(timerRef.current);
    setState("ended");
  }

  function logCall() {
    addActivity(lead.place_id, {
      channel: "call",
      direction: "out",
      outcome,
      notes:
        (notes.trim() || `Call ${outcome} · ${mmss(seconds)}`) +
        " — demo, no real call placed.",
    });
    if (outcome === "booked" && apptAt) {
      const iso = fromInput(apptAt);
      if (iso) setAppointment(lead.place_id, iso);
    }
    onClose();
  }

  const mm = mmss(seconds);

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-paper rounded-card shadow-float modal-in overflow-hidden">
        {/* Soft-phone head */}
        <div className="bg-ink text-white px-5 py-4">
          <div className="eyebrow-xs text-white/50">{stateLabel(state)}</div>
          <div className="font-semibold text-[1.05rem] mt-0.5">{lead.name}</div>
          <div className="mono-num text-white/70 text-[0.85rem]">{lead.phone ?? "no number"}</div>
          <div className="flex items-center justify-between mt-3">
            <div className="mono-num text-2xl font-semibold tabular-nums">
              {state === "connected" || state === "ended" ? mm : "00:00"}
            </div>
            {state !== "ended" ? (
              <button
                onClick={endCall}
                className="bg-critical text-white rounded-full w-10 h-10 flex items-center justify-center text-lg hover:opacity-90"
                title="End call"
              >
                ✕
              </button>
            ) : (
              <span className="text-white/40 text-[0.7rem] font-mono uppercase tracking-wide">
                call ended
              </span>
            )}
          </div>
        </div>

        {/* Outcome form (after call ends) */}
        <div className="p-4">
          {state !== "ended" ? (
            <div className="flex items-center gap-2 text-[0.78rem] text-muted">
              <span className="inline-flex gap-1 text-indigo">
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
                <span className="typing-dot">·</span>
              </span>
              {state === "connected" ? "On the call — end it to log the outcome." : "Dialing…"}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="eyebrow-xs block mb-1">Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as (typeof OUTCOMES)[number])}
                  className="field-input"
                >
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              {outcome === "booked" && (
                <div>
                  <label className="eyebrow-xs block mb-1">Appointment</label>
                  <input
                    type="datetime-local"
                    value={apptAt || toDateTimeInput(new Date(Date.now() + 86400000).toISOString())}
                    onChange={(e) => setApptAt(e.target.value)}
                    className="field-input field-mono"
                  />
                </div>
              )}
              <div>
                <label className="eyebrow-xs block mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What happened on the call…"
                  className="field-input resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.62rem] text-faint font-mono">demo — no real call placed</span>
                <button onClick={logCall} className="btn-indigo">
                  Log call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

function mmss(total: number): string {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function stateLabel(s: CallState): string {
  switch (s) {
    case "connecting":
      return "Connecting…";
    case "ringing":
      return "Ringing…";
    case "connected":
      return "Connected";
    case "ended":
      return "Call ended";
  }
}

/** Shared modal overlay. */
export function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 overlay-in"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
