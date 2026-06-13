"use client";

import type { Lead } from "@/lib/pipeline/types";
import { money, dueLabel } from "@/lib/pipeline/format";
import { GradeBadge, NoSiteBadge, RatingPip } from "./Badges";

/** A single Kanban lead card. Click → opens the LeadDetail drawer. */
export function LeadCard({
  lead,
  justDropped = false,
  onOpen,
}: {
  lead: Lead;
  justDropped?: boolean;
  onOpen: (id: string) => void;
}) {
  const due = dueLabel(lead.next_action_due);
  const hasBooked = lead.appointment_at && lead.appointment_status === "booked";

  return (
    <button
      type="button"
      onClick={() => onOpen(lead.place_id)}
      className={`lead-card w-full text-left p-2.5 ${justDropped ? "card-drop" : ""}`}
    >
      {/* Top row: name + grade */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-ink text-[0.82rem] leading-tight tracking-tightish min-w-0">
          {lead.name}
        </div>
        <GradeBadge grade={lead.grade} fitScore={lead.fit_score} size="sm" />
      </div>

      {/* Owner / category + No-site */}
      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
        <span className="text-[0.7rem] text-muted truncate">
          {lead.owner_name ?? lead.category}
        </span>
        {!lead.platform && <NoSiteBadge />}
      </div>

      {/* Rating */}
      {lead.rating != null && (
        <div className="mt-1.5">
          <RatingPip rating={lead.rating} reviews={lead.review_count} />
        </div>
      )}

      {/* Next action */}
      {lead.next_action && (
        <div className="mt-2 text-[0.7rem] text-ink-soft leading-snug line-clamp-2">
          <span className="text-faint">▸ </span>
          {lead.next_action}
          {due.text && (
            <span className={`ml-1 mono-num ${due.overdue ? "text-critical" : "text-muted"}`}>
              · {due.text}
            </span>
          )}
        </div>
      )}

      {/* Footer: contact icons + deal value */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-line">
        <div className="flex items-center gap-1.5 text-faint text-[0.72rem]">
          {lead.phone && <span title={lead.phone}>✆</span>}
          {lead.email && <span title={lead.email}>✉</span>}
          {hasBooked && <span title="Appointment booked" className="text-indigo">◷</span>}
        </div>
        <span className="mono-num text-[0.74rem] font-semibold text-ink">
          {money(lead.deal_value)}
        </span>
      </div>
    </button>
  );
}
