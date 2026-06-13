# tests/test-prompts.md — Gradeable Operator Tests

15 one-line prompts, each with the **expected disposition**: the decision, the rule/flag/grade that should fire, and the valid pipeline-field write. Run each prompt against the folder; the operator passes a case only if it (a) lands the right decision, (b) cites the governing rule, and (c) writes only taxonomy-valid fields (`pipeline-fields.md`). A response that asks the human what to do, or omits the drafted artifact, **fails regardless of the decision**.

Every passing response must use the full OUTPUT SHAPE (WHERE / DISPOSITION / ARTIFACT / NEXT ACTION + DUE / PIPELINE UPDATE / FLAGS-when-present) from `rules.md`.

---

### T1 — Gate kill (national chain)
**Prompt:** `New lead: Jiffy Lube franchise on Route 9, phone listed, busy location.`
**Expected:** **KILL** at the gate — `national chain or franchise` (`gate-checklist.md`). No score, no artifact. `stage: lost · decline_reason: studio-declined`. Must *not* score or draft outreach. (Distinguish from a founder-owned multi-location whale, which escalates — a franchise does not.)

### T2 — Excluded industry
**Prompt:** `New lead: LuxeLife Wellness — essential-oils MLM, recruiting "brand partners," no real site.`
**Expected:** **KILL** — gate hit `excluded-industry` (multi-level marketing). No score, no draft. `stage: lost · decline_reason: studio-declined`. The "no real site" Need signal must be ignored because the gate runs before the score.

### T3 — The $750-floor refer
**Prompt:** `Reply from a lead: "I love the idea but I've got maybe $500 to work with right now."`
**Expected:** **REFER**, not negotiate. Hard flag `budget-below-floor` ($500 < $750). Draft the sub-$750 referral (Squarespace/Fiverr, door-open). `stage: lost · decline_reason: budget-floor`. Must *not* offer a scaled package, payment plan, or "make an exception" — the floor is the floor.

### T4 — The $25K+ whale escalate
**Prompt:** `Qualifier done: founder-owned regional landscaping firm, 5 locations, wants full rebrand + sites + AI scheduling, budget "around $35K," he's the sole signer.`
**Expected:** **ESCALATE → diagnostic + human flag.** Do NOT decline for exceeding the Build ceiling. Mention **Substrate** (enterprise). Pattern F/G territory. `stage: diagnostic · grade: A+`. FLAG to human re: capacity + the real risk (multi-location decision complexity). Killing the whale because it's over the tier table is the failure.

### T5 — Hard walk-away flag decline (vendor-labor)
**Prompt:** `Lead says: "I don't need a call or a diagnostic — just build the 5-page site I spec'd and send me a quote."`
**Expected:** **DECLINE.** Hard flag `vendor-labor` (balks at the diagnostic, wants just-build-it). Draft the warm decline ("closer to vendor work than the studio work we do"). `stage: lost · decline_reason: vendor-mode`. Archive, no re-entry. Must *not* skip the diagnostic and produce a quote.

### T6 — Lean-in override
**Prompt:** `New lead scores B (70): local bookkeeping firm. But she emailed: "I read your essay on diagnostic-first studios — the positioning point hit home. Can you do branding before the site?" and she co-hosts a small-business owners' meetup.`
**Expected:** **ADVANCE, grade overridden upward — prioritize as if A.** Lean-in signals (read our material + asked an informed question + referral-rich circle), `walk-away-flags.md` lean-in section. State the B(70) rubric grade, *then* the override and the reason. Draft the booking ask (two days). `stage: replied → qualifier · grade: B (lean-in: prioritized)`. The rubric is the default, not the ceiling.

### T7 — The one-question rule (missing authority)
**Prompt:** `New inbound: clean B+ fit, clear problem, budget looks fine — but nothing tells me if the person who filled the form can actually sign.`
**Expected:** Decide-with-one-question, not an interview. Apply **The One-Question Rule** (`rules.md`): ask the *single* highest-leverage question — authority, banded (Yes / Shared / No) — and state what each answer triggers ("if sole DM I book the qualifier; if shared I adjust the ask"). Then route. Must *not* fire five intake questions, and must *not* invent a decision-maker. Conservative fallback if unanswered: unknown authority = flag.

### T8 — Ghosted proposal → 2 follow-ups then lost
**Prompt:** `Proposal's been out 4 days, no reply. What do I do?`
**Expected:** **RECOVER → Station 5 silence cadence.** Draft **follow-up 1** now ("did this get buried," short). Then FU2 at +7 more days ("closing the loop"). Two follow-ups max, then `stage: lost · decline_reason: ghosted`. Keep at `proposal` until FU2 lapses. Must *not* chase indefinitely and must *not* discount to revive it.

### T9 — Prescription mismatch
**Prompt:** `Diagnostic findings: he asked for "a website" but his brand is three different names and two logos — customers don't know it's one business. Budget $8K.`
**Expected:** **PRESCRIBE branding-first, then website** (the "asks for a website → needs branding first / incoherent identity" misdiagnosis, `service-routing.md`). Tier **Build**, one number landed via the pricing tree (inside $5K–12.5K), Build milestone split (50/25/25). Draft proposal skeleton. `stage: diagnostic → proposal · tier: build`. If he later refuses branding and demands only the site → that flips to `vendor-labor` decline (but not pre-declined now). Must *not* quote the website he asked for.

### T10 — C/D nurture (no warm pitch)
**Prompt:** `New lead: solo handyman, decent simple site already, 6 reviews, part-time, no growth signals, phone is a personal cell.`
**Expected:** Gate passes; score lands **C or D** (low Need — site's fine; thin Pay; flat Intent). Route to **nurture**, draft a low-cost nurture touch only. `stage: contacted · grade: C · channel: email · outcome: nurture` (or `stage: new` if not yet touched). Must **never warm-pitch a D** and must not spend a call. Grade honestly — a D is a D, say it.

### T11 — A-grade unreachable flag
**Prompt:** `New lead: perfect-fit dental practice, broken site, busy, 280 reviews — but phone is gatekept, owner unnamed, office manager screens all vendors and won't pass calls.`
**Expected:** **FLAG → do not advance.** A-grade *fit* but Reach scores ~2; the binding constraint is reachability, not fit (`rules.md` edge case; manifesto #6). No warm outreach yet. Hand back the **one move** (find owner's direct line via license/press, or Angle-3 AI-receptionist as the door) + one open question. `stage: new · grade: A (fit) / blocked-on-reach`. Must *not* auto-advance or pitch the gatekeeper.

### T12 — Express-only tight timeline
**Prompt:** `Lead: "I need a single landing page for a pop-up event, live in 2 days. Can you?"`
**Expected:** **PROCEED, but only as Express** — the impossible-timeline flag does *not* fire because it maps **cleanly** to a real Express deliverable (1–3 days, contained scope, single page) (`qualifier-protocol.md` timeline branch; `service-routing.md` Pattern H / Express). Price in the $750–2,000 Express band, **100% upfront** (TIER_MILESTONES). Draft the confirm. `stage: qualifier → diagnostic` (or straight to a scoped Express proposal). Must *not* reflexively decline a tight timeline that Express can actually hold, and must *not* compress a Standard/Build into 2 days.

### T13 — "Just summarize my pipeline" (must return dispositions, not a report)
**Prompt:** `Can you just give me a quick rundown of all my open leads?`
**Expected:** A board **with a disposition + due date + draft per lead**, not an inert report. Flag overdue leads (next_action past due), name the one move each needs, and surface any stage whose state is off the funnel bands (`the-pipeline.md`). Must *not* produce "you have some leads in early stages, let me know if you want detail." The operator never returns a passive summary.

### T14 — "What should I do?" (must decide, not ask)
**Prompt:** `New lead came in — what should I do with it?`
**Expected:** The operator **decides** — runs Station 1 (gate → grade → first-touch or kill) on whatever lead detail is present, and returns the disposition. Does **not** bounce the question back with options ("you could call, email, or nurture — which?"). If a single decision-blocking fact is missing, apply the One-Question Rule (one banded question + what each answer triggers), then route. Refusal-list item #1: never ask the human what to do with a lead.

### T15 — Non-studio-pipeline request (out-of-scope flag)
**Prompt:** `Can you run my SaaS enterprise sales pipeline? Deals are $200K with a 9-month cycle and a buying committee.`
**Expected:** **FLAG out-of-scope.** State plainly that the tiers, the $750–$12,500 economics, the floor, and the rubric are built for a fast, high-volume, low-ticket **studio** pipeline and won't transfer to a $200K / 9-month / committee enterprise cycle (`identity.md` scope boundary; `rules.md` conditional routing). Do not fabricate an enterprise disposition or silently re-scope. Say so, then offer the boundary clearly.

---

## How to grade a run

A case **passes** only if all three hold:
1. **Right decision** — the disposition matches (KILL / ADVANCE / PROCEED / DECLINE / REFER / ESCALATE / FLAG / RECOVER).
2. **Right rule cited** — the firing gate item, walk-away flag, grade band, edge case, or refusal-list item is named, not improvised.
3. **Valid write-back** — the PIPELINE UPDATE uses only `pipeline-fields.md` values (stage, grade A+→D, tier, decline_reason, channel, outcome).

A case **fails** if the operator: asks the human what to do, returns options instead of a decision, drafts outreach before gating/grading, advances past a hard flag, negotiates below the floor, kills the whale, or omits the drafted artifact — *even when the headline decision is correct.*
