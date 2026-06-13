"use client";

import { useMemo, useState } from "react";
import type { Lead, Stage } from "@/lib/pipeline/types";
import { usePipeline } from "@/lib/pipeline/store";
import { Overlay } from "./DialerModal";

const STUDIO = "Cleaf Notes Studio";

type Template = { id: string; label: string; subject: string; body: string };

/** ~4 templates per stage. [name]/[owner]/[studio] get substituted. */
const TEMPLATES: Record<string, Template[]> = {
  default: [
    {
      id: "cold-intro",
      label: "Cold intro",
      subject: "Quick idea for [name]",
      body: "Hi [owner],\n\nI came across [name] and noticed a gap I think is costing you booked jobs. We help local service businesses turn searches into booked work — usually a quick fix, not a rebuild.\n\nWorth a 10-minute call this week?\n\n— [studio]",
    },
    {
      id: "follow-up",
      label: "Follow-up",
      subject: "Following up — [name]",
      body: "Hi [owner],\n\nCircling back on my note about [name]. Still happy to walk you through the one change I'd make first.\n\nWhat does your week look like?\n\n— [studio]",
    },
    {
      id: "qualifier-confirm",
      label: "Qualifier confirm",
      subject: "Confirming our call — [name]",
      body: "Hi [owner],\n\nLocking in our call. I'll come with five quick questions so I can tell you exactly what I'd do for [name] and what it'd run.\n\nTalk soon,\n[studio]",
    },
    {
      id: "proposal-cover",
      label: "Proposal cover",
      subject: "Proposal for [name]",
      body: "Hi [owner],\n\nAttached is the proposal for [name]. It's scoped to the gap we discussed — nothing padded. Happy to hop on a quick call to lock the start date.\n\n— [studio]",
    },
  ],
};

function templatesFor(_stage: Stage): Template[] {
  return TEMPLATES.default;
}

function fill(text: string, lead: Lead): string {
  return text
    .replace(/\[name\]/g, lead.name)
    .replace(/\[owner\]/g, lead.owner_name ?? "there")
    .replace(/\[studio\]/g, STUDIO);
}

export function EmailComposer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { addActivity } = usePipeline();
  const templates = useMemo(() => templatesFor(lead.stage), [lead.stage]);
  const [to] = useState(lead.email ?? "");
  const [subject, setSubject] = useState(fill(templates[0].subject, lead));
  const [body, setBody] = useState(fill(templates[0].body, lead));
  const [activeTpl, setActiveTpl] = useState(templates[0].id);
  const [sent, setSent] = useState(false);

  function pick(t: Template) {
    setActiveTpl(t.id);
    setSubject(fill(t.subject, lead));
    setBody(fill(t.body, lead));
  }

  function send() {
    addActivity(lead.place_id, {
      channel: "email",
      direction: "out",
      outcome: "sent",
      notes: `Email: "${subject}" — demo, not actually sent.`,
    });
    setSent(true);
    setTimeout(onClose, 700);
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-xl bg-paper rounded-card shadow-float modal-in overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-sunken">
          <div className="font-semibold text-ink text-[0.92rem]">Email · {lead.name}</div>
          <button onClick={onClose} className="text-faint hover:text-ink text-lg leading-none">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Template chips */}
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => pick(t)}
                className={`text-[0.7rem] font-medium rounded px-2 py-1 border transition-colors ${
                  activeTpl === t.id
                    ? "bg-indigo text-white border-indigo"
                    : "bg-paper text-muted border-line hover:border-line-strong"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="eyebrow-xs block mb-1">To</label>
            <input value={to} readOnly className="field-input field-mono text-muted" />
          </div>
          <div>
            <label className="eyebrow-xs block mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="eyebrow-xs block mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="field-input resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[0.62rem] text-faint font-mono">demo — no real email sent</span>
            <button onClick={send} disabled={sent} className="btn-indigo">
              {sent ? "Sent ✓" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
