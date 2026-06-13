# working-theory.md — Live Per-Lead Memory

This is the operator's memory. It is **not** a static file — it is a live scaffold, updated after every disposition. Read it before acting on a lead you've touched before, so you don't re-decide from scratch or re-ask a question the human already answered. Keep one block per active lead. Archive a block when the lead reaches `won` or `lost`.

The operator parses this at session start. Keep it structured but human-readable.

---

## Format (copy this block per lead)

```
## [Business name] — [stage] — grade [A+/A/B/C/D]
- Station: [where it is in the pipeline]
- Last touch: [channel + outcome + date]
- Grade rationale: [the dimension reads that set the grade — e.g. Need 9 / Reach 5]
- Known: [budget band, authority, timeline, the real problem — what's confirmed]
- Open question: [the single fact that would change the disposition]
- Flags: [any walk-away or lean-in signals seen]
- Next action: [what's due, and when]
- Notes: [anything the next disposition needs]
```

---

## Active leads (example state — replace with real)

## Maria's House Cleaning — qualifier — grade B+
- Station: 3 (qualify) — diagnostic-confirm sent, call booked Wed AM
- Last touch: call → replied → booked (Mon)
- Grade rationale: Need 9 (no site), Fit 9 (local, owner-run), Reach 8 (owner + phone), Pay 5 (14 reviews), Intent 4
- Known: budget "$2.5–3.5K works"; Maria is sole decision-maker; problem = "people can't find me, all word-of-mouth"; timeline "next month"
- Open question: none blocking — diagnostic will surface the real scope
- Flags: lean-in (answered budget honestly, respects the process)
- Next action: run the diagnostic Wed; draft proposal within 24h (likely Pattern A — Standard website)
- Notes: aesthetic signal unknown; ask for 3 sites she likes in the diagnostic

## Apex HVAC — contacted — grade B
- Station: 2 (outreach outcome) — no answer, voicemail left Fri, NO retry yet (overdue)
- Last touch: call → no_answer (Fri)
- Grade rationale: Need 6 (good site, but missed-call pain), Fit 9, Reach 5 (no owner name), Pay 8, Intent 4
- Known: nothing confirmed — never reached a human
- Open question: who's the owner / decision-maker? (front desk can give the name)
- Flags: none
- Next action: retry today (dial #2 of 3); if no answer → SMS the AI-receptionist one-liner; if dial #3 fails → nurture
- Notes: lead with Angle 3 (receptionist), not a website pitch — their site is fine

## Crestline Dental — proposal — grade A
- Station: 5 (close/recover) — proposal sent, silent 5 days
- Last touch: email → sent (proposal, 5d ago)
- Grade rationale: A (90) — strong on all five
- Known: budget $5–8K (Build); decision-maker confirmed; problem = dated site + no online booking; Pattern D-ish
- Open question: is the silence price, timing, or buried email?
- Flags: none — was a clean qualifier + diagnostic
- Next action: fire follow-up 2 ("closing the loop") today; if silent 7 more days → `lost: ghosted`
- Notes: do NOT discount to win; if they object on price, hold and offer a phased start, not a lower number
