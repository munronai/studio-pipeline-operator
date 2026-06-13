"use client";

import { useEffect, useState } from "react";
import {
  type Activity,
  type ActivityChannel,
  type Lead,
  type Stage,
  type DeclineReason,
  BOARD_STAGES,
  DECLINE_REASONS,
  STAGE_LABEL,
} from "@/lib/pipeline/types";
import { usePipeline } from "@/lib/pipeline/store";
import { moneyFull, relTime, dueLabel, toDateInput, toDateTimeInput, fromInput } from "@/lib/pipeline/format";
import { GradeBadge, StageBadge, NoSiteBadge, RatingPip } from "./Badges";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { DialerModal } from "./DialerModal";
import { EmailComposer } from "./EmailComposer";

const CHANNELS: ActivityChannel[] = ["call", "sms", "email", "linkedin", "walk-in", "referral", "note"];
const LOG_OUTCOMES = ["connected", "no_answer", "voicemail", "sent", "replied", "booked", "left-note", "no_show"];

const CHAN_GLYPH: Record<ActivityChannel, string> = {
  call: "✆",
  sms: "✱",
  email: "✉",
  linkedin: "in",
  "walk-in": "⮕",
  referral: "↪",
  note: "✎",
  system: "⚙",
};

/** Right-side slide-over lead detail. Mirrors the Lead CRM two-column layout. */
export function LeadDetail({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const { getLead } = usePipeline();
  const lead = getLead(leadId);
  const [dialer, setDialer] = useState(false);
  const [email, setEmail] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!lead) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 overlay-in" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-drawer h-full bg-paper shadow-float drawer-in overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-paper border-b border-line px-5 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="eyebrow-xs">{lead.category}</div>
                <h2 className="font-semibold text-ink text-[1.2rem] tracking-tighter2 mt-0.5 leading-tight">
                  {lead.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-faint hover:text-ink text-xl leading-none shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <GradeBadge grade={lead.grade} fitScore={lead.fit_score} />
              <StageBadge stage={lead.stage} />
              {!lead.platform && <NoSiteBadge />}
            </div>
            {/* Meta row */}
            <div className="flex items-center gap-x-3 gap-y-1 mt-2.5 flex-wrap text-[0.72rem] text-muted">
              {lead.phone && <span className="mono-num">✆ {lead.phone}</span>}
              {lead.email && <span className="mono-num truncate max-w-[180px]">✉ {lead.email}</span>}
              {lead.website && (
                <a
                  href={`https://${lead.website.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo hover:underline mono-num"
                >
                  ↗ {lead.website}
                </a>
              )}
              <RatingPip rating={lead.rating} reviews={lead.review_count} />
              {lead.address && <span>· {lead.address}</span>}
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid md:grid-cols-[1fr_280px] gap-0">
            {/* LEFT */}
            <div className="p-5 space-y-5 md:border-r border-line">
              {/* Profile */}
              <section>
                <div className="eyebrow-xs mb-1.5">Business profile</div>
                {lead.description && (
                  <p className="text-[0.82rem] text-ink-soft leading-relaxed">{lead.description}</p>
                )}
                {lead.selling && (
                  <p className="text-[0.78rem] text-muted leading-relaxed mt-2">
                    <span className="font-semibold text-ink">Selling: </span>
                    {lead.selling}
                  </p>
                )}
              </section>

              {/* Opener */}
              {lead.opener && (
                <section>
                  <div className="eyebrow-xs mb-1.5">Personalized opener</div>
                  <blockquote className="text-[0.82rem] italic text-ink-soft leading-relaxed border-l-2 border-indigo pl-3">
                    &ldquo;{lead.opener}&rdquo;
                  </blockquote>
                </section>
              )}

              {/* Score breakdown */}
              <section>
                <ScoreBreakdown lead={lead} />
              </section>

              {/* Pain signals */}
              {lead.pain_signals.length > 0 && (
                <section>
                  <div className="eyebrow-xs mb-1.5">Pain signals</div>
                  <ul className="space-y-1">
                    {lead.pain_signals.map((p, i) => (
                      <li key={i} className="flex gap-2 text-[0.78rem] text-ink-soft">
                        <span className="text-critical mt-0.5 text-[0.7rem]">▪</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Activity timeline */}
              <section>
                <ActivityTimeline lead={lead} />
              </section>
            </div>

            {/* RIGHT — action rail */}
            <aside className="p-4 space-y-4 bg-bg">
              <ActionRail
                lead={lead}
                onCall={() => setDialer(true)}
                onEmail={() => setEmail(true)}
              />
            </aside>
          </div>
        </div>
      </div>

      {dialer && <DialerModal lead={lead} onClose={() => setDialer(false)} />}
      {email && <EmailComposer lead={lead} onClose={() => setEmail(false)} />}
    </>
  );
}

/* ---------------- activity timeline ---------------- */

function ActivityTimeline({ lead }: { lead: Lead }) {
  const { addActivity } = usePipeline();
  const [channel, setChannel] = useState<ActivityChannel>("note");
  const [outcome, setOutcome] = useState("left-note");
  const [notes, setNotes] = useState("");

  const sorted = [...lead.activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  function log() {
    addActivity(lead.place_id, {
      channel,
      direction: channel === "email" || channel === "sms" ? "out" : "out",
      outcome,
      notes: notes.trim() || null,
    });
    setNotes("");
  }

  return (
    <div>
      <div className="eyebrow-xs mb-2">Activity timeline</div>

      {/* Log-touch mini form */}
      <div className="bg-paper border border-line rounded-card p-2.5 mb-3 space-y-2">
        <div className="flex gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ActivityChannel)}
            className="field-input flex-1"
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="field-input flex-1"
          >
            {LOG_OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="field-input"
        />
        <div className="flex justify-end">
          <button onClick={log} className="btn-indigo text-[0.74rem] py-1">
            Log touch
          </button>
        </div>
      </div>

      {/* Timeline list */}
      {sorted.length === 0 ? (
        <div className="text-[0.74rem] text-faint">No activity yet.</div>
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((a) => (
            <TimelineRow key={a.id} a={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TimelineRow({ a }: { a: Activity }) {
  return (
    <li className="flex gap-2.5">
      <span className="chan-pip mt-0.5" title={a.channel}>
        {CHAN_GLYPH[a.channel]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.76rem] font-semibold text-ink capitalize">
            {a.channel}
            {a.outcome && <span className="text-muted font-normal"> · {a.outcome.replace(/_/g, " ")}</span>}
          </span>
          <span className="mono-num text-[0.64rem] text-faint shrink-0">{relTime(a.created_at)}</span>
        </div>
        {a.notes && <div className="text-[0.72rem] text-muted leading-snug mt-0.5">{a.notes}</div>}
      </div>
    </li>
  );
}

/* ---------------- action rail ---------------- */

function ActionRail({
  lead,
  onCall,
  onEmail,
}: {
  lead: Lead;
  onCall: () => void;
  onEmail: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Primary tools */}
      <div className="space-y-2">
        <button
          onClick={onCall}
          disabled={!lead.phone}
          className="btn-indigo w-full justify-center disabled:opacity-40"
        >
          ✆ Call &amp; record
        </button>
        <button
          onClick={onEmail}
          disabled={!lead.email}
          className="btn-ghost w-full justify-center text-[0.82rem] py-2 flex disabled:opacity-40"
        >
          ✉ Email
        </button>
      </div>

      <SchedulerPanel lead={lead} />
      <NextActionPanel lead={lead} />
      <StagePanel lead={lead} />
    </div>
  );
}

/* ---------------- scheduler ---------------- */

function SchedulerPanel({ lead }: { lead: Lead }) {
  const { setAppointment, setApptStatus } = usePipeline();
  const [val, setVal] = useState(toDateTimeInput(lead.appointment_at));
  const [, force] = useState(0);

  // Live countdown tick.
  useEffect(() => {
    if (!lead.appointment_at) return;
    const t = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, [lead.appointment_at]);

  const due = dueLabel(lead.appointment_at);

  return (
    <div className="bg-paper border border-line rounded-card p-3">
      <div className="eyebrow-xs mb-2">Appointment</div>
      <input
        type="datetime-local"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="field-input field-mono mb-2"
      />
      <button
        onClick={() => setAppointment(lead.place_id, fromInput(val))}
        className="btn-indigo w-full justify-center text-[0.76rem] py-1.5"
      >
        Set appointment
      </button>

      {lead.appointment_at && (
        <div className="mt-2.5 pt-2.5 border-t border-line">
          <div className="flex items-center justify-between">
            <span className="text-[0.72rem] text-muted mono-num">
              {new Date(lead.appointment_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className={`mono-num text-[0.72rem] font-semibold ${due.overdue ? "text-critical" : "text-indigo"}`}>
              {due.text}
            </span>
          </div>
          {lead.appointment_status && (
            <div className="text-[0.66rem] font-mono uppercase tracking-wide text-faint mt-1">
              status: {lead.appointment_status.replace(/_/g, " ")}
            </div>
          )}
          {lead.meeting_url && (
            <a
              href={lead.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[0.7rem] text-indigo hover:underline mt-1 truncate"
            >
              ↗ Meeting link
            </a>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(["no_show", "done", "cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setApptStatus(lead.place_id, s)}
                className="text-[0.66rem] font-medium rounded px-2 py-0.5 border border-line text-muted hover:border-line-strong hover:text-ink"
              >
                {s === "no_show" ? "No-show" : s === "done" ? "Mark done" : "Cancel"}
              </button>
            ))}
            <button
              onClick={() => setApptStatus(lead.place_id, "booked")}
              className="text-[0.66rem] font-medium rounded px-2 py-0.5 border border-line text-muted hover:border-line-strong hover:text-ink"
            >
              Re-book
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- next action ---------------- */

function NextActionPanel({ lead }: { lead: Lead }) {
  const { updateLead } = usePipeline();
  const [text, setText] = useState(lead.next_action ?? "");
  const [date, setDate] = useState(toDateInput(lead.next_action_due));

  return (
    <div className="bg-paper border border-line rounded-card p-3">
      <div className="eyebrow-xs mb-2">Next action</div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's the next move?"
        className="field-input mb-2"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="field-input field-mono mb-2"
      />
      <button
        onClick={() =>
          updateLead(lead.place_id, {
            next_action: text.trim() || null,
            next_action_due: date ? fromInput(date) : null,
          })
        }
        className="btn-indigo w-full justify-center text-[0.76rem] py-1.5"
      >
        Set
      </button>
    </div>
  );
}

/* ---------------- stage control ---------------- */

function StagePanel({ lead }: { lead: Lead }) {
  const { moveStage } = usePipeline();
  const [stage, setStage] = useState<Stage>(lead.stage);
  const [deal, setDeal] = useState<string>(lead.deal_value != null ? String(lead.deal_value) : "");
  const [reason, setReason] = useState<DeclineReason>(
    (DECLINE_REASONS.includes(lead.decline_reason as DeclineReason)
      ? (lead.decline_reason as DeclineReason)
      : "ghosted")
  );

  function apply() {
    moveStage(lead.place_id, stage, {
      deal_value: deal.trim() === "" ? null : Number(deal),
      decline_reason: stage === "lost" ? reason : null,
    });
  }

  return (
    <div className="bg-paper border border-line rounded-card p-3">
      <div className="eyebrow-xs mb-2">Pipeline stage</div>
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value as Stage)}
        className="field-input mb-2"
      >
        {BOARD_STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_LABEL[s]}
          </option>
        ))}
      </select>
      <label className="eyebrow-xs block mb-1">Deal value</label>
      <input
        type="number"
        value={deal}
        onChange={(e) => setDeal(e.target.value)}
        placeholder="0"
        className="field-input field-mono mb-2"
      />
      {stage === "lost" && (
        <>
          <label className="eyebrow-xs block mb-1">Decline reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as DeclineReason)}
            className="field-input mb-2"
          >
            {DECLINE_REASONS.map((r) => (
              <option key={r} value={r}>
                {r.replace(/-/g, " ")}
              </option>
            ))}
          </select>
        </>
      )}
      <div className="text-[0.64rem] text-faint mono-num mb-2">
        current value: {moneyFull(lead.deal_value)}
      </div>
      <button onClick={apply} className="btn-indigo w-full justify-center text-[0.76rem] py-1.5">
        Update stage
      </button>
    </div>
  );
}
