# The Pipeline Operator

**A folder-based AI operator that runs a diagnostic-first digital studio's entire sales pipeline — inbound or outbound lead, all the way to a closed deal. You paste in a lead at any stage; it decides the disposition, drafts the next action, and tells you exactly what to write to the CRM. You just send or call.**

Built for: a solo studio founder selling $750–$12,500 engagements who sources 40–60 leads a week and loses half their day to triage and follow-through instead of selling.

**▶ Live demo — a working pipeline, not a slide: https://pipeline-operator.vercel.app/board** — an interactive Kanban seeded with real leads. Paste a lead into the Run panel and watch the operator decide live (on the real API, loading this exact folder as its system prompt) and **move the card into the right stage bucket**. Click any card for the full lead detail — score breakdown, activity timeline, and a working dialer, email composer, and scheduler. Or run the side-by-side duel against a generic assistant.

---

## See the difference in 30 seconds

Same input. A chatbot describes the lead. The operator *operates* on it.

**Input:** `New lead — Maria's House Cleaning, no website, 14 Google reviews (4.6★), phone listed, owner "Maria" in the profile, suburban Denver.`

**A generic assistant:**
> Here's a summary of the lead and some things to consider. Maria's House Cleaning is a local cleaning business with decent reviews and no website, which could be an opportunity. You might want to think about your budget, whether they're a good fit, and how to reach out. Would you like me to draft a few different outreach options for you to choose from?

**The Pipeline Operator:**
> **WHERE** — New scraped lead, pre-contact.
> **DISPOSITION** — **ADVANCE → outreach (call first).** Grade **B+ (76).** Need 9 (no website at all — high need), Fit 9 (local service, owner-run, target vertical), Reach 8 (owner named + phone), Pay 5 (14 reviews = established but small), Intent 4 (no growth signal). Gate: passed.
> **ARTIFACT — Cold call, Angle 1 (specific observation):**
> *"Hey Maria, this is Jayden — quick question before you go. I was looking at your cleaning business and noticed you don't have a website at all, just the Google listing. That something you've been meaning to set up?"*
> If she engages, run the 60-second qualifier (problem real? · decision-maker? · "$2,500–3,500 range work for you?"). If green, close for a 15-min call: *"Are you free Tuesday or Wednesday morning?"*
> **NEXT ACTION** — Call Tue/Wed AM. No answer → voicemail + SMS the portfolio link, retry within 48h (cap 3 dials).
> **PIPELINE UPDATE** — `stage: contacted · grade: B+ · channel: call · next_action_due: +2d`

One of them you can act on right now. That's the whole assignment.

---

## What this is (and what it is not)

It is an **operator**: it makes a decision and routes the work. It is **not** a chatbot (it never asks you what to do), and **not** a CRM (it doesn't just store the lead — it changes its state). The folder *is* the operator. Drop it into a Claude Project and Claude becomes the pipeline desk for your studio.

It owns the full funnel: `new → contacted → replied → qualifier → diagnostic → proposal → won` (and `lost`). Six decision stations, one per transition, each grounded in the studio's real decision logic — the same gate filters, 5-dimension scoring rubric, walk-away flags, qualifier protocol, and service-routing patterns the live CRM runs on.

---

## The live demo is a working pipeline

[`/board`](https://pipeline-operator.vercel.app/board) is the operator wired into a real sales-pipeline UI — built to the same fidelity as the studio's production lead CRM:

- **Interactive Kanban** — eight stage columns seeded with leads, each column showing count, pipeline value, A-tier count, and a heat bar. Cards carry the grade, deal value, next action, and contact methods.
- **The operator moves the board** — paste a lead in the Run panel; the operator decides live and the card **routes itself to the correct bucket**: `advance` → next stage, `escalate` → Diagnostic (the whale), `refer / decline / kill` → Lost with a reason. The decision physically changes pipeline state — the whole point of an operator over a chatbot.
- **Full lead detail** — click any card for the 5-signal score breakdown (with per-dimension evidence), pain signals, and a unified activity timeline.
- **The desk tools** — a click-to-call **dialer** (with outcome logging), a templated **email composer**, and a **scheduler** (booking + live countdown + no-show/done/cancel). Every action writes to the lead's timeline.

The brain is unchanged — the app loads this folder as the system prompt. The UI is just the surface the operator drives. *(Demo state is client-side with a Reset button; the dialer/email/scheduler are mocked, so trying it costs nothing.)*

---

## Folder map (each file does one job)

```
studio-pipeline-operator/
├── CLAUDE.md            ← Read first. Identity + the routing table (which file for which input).
├── identity.md          ← Who the operator is. The manifesto (8 convictions that govern every call).
├── rules.md             ← The Disposition Engine: the output shape, the 6 stations, edge cases, the refusal list.
├── examples.md          ← Annotated dispositions — one per station, plus the hard edge cases.
├── anti-examples.md     ← Side-by-side: generic assistant (wrong) vs operator (right).
├── working-theory.md    ← Live, per-lead memory. Updated after every disposition.
├── reference/           ← Pulled as needed, never preloaded:
│   ├── INDEX.md
│   ├── the-pipeline.md       ← stations + funnel math
│   ├── gate-checklist.md     ← hard auto-disqualify filters
│   ├── scoring-rubric.md     ← the 5-dimension grade (weights, anchors, thresholds, routing)
│   ├── walk-away-flags.md    ← hard flags · soft flags · lean-in signals · decline script
│   ├── qualifier-protocol.md ← the 5 questions + budget/timeline branches
│   ├── diagnostic-protocol.md← the 60-min diagnostic structure
│   ├── service-routing.md    ← patterns A–H + tiers + pricing tree + milestones
│   ├── outreach-templates.md ← call angles 1/2/3 · email · follow-ups · SMS · decline · referral
│   └── pipeline-fields.md    ← exact stage / outcome / decline-reason / channel taxonomy
├── tests/
│   └── test-prompts.md  ← 15 inputs with the disposition each should produce.
├── LICENSE
└── .gitignore
```

---

## How to use it

**Option A — Claude Project (recommended).** Create a new Project, upload this folder (or paste the files), and tell Claude: *"Load CLAUDE.md and operate."* Then paste any lead — a scraped business, a reply, a set of qualifier answers, a proposal that went silent — and it returns the disposition + drafted artifact + the field writes.

**Option B — One file.** Paste `CLAUDE.md`, `identity.md`, and `rules.md` into any Claude chat, then paste a lead. You'll lose the reference depth but keep the decision engine.

**The input can be anything in the pipeline.** "Score this scraped business." "He replied 'maybe, send me info.'" "Qualifier done — here are her 5 answers." "Proposal's been quiet 4 days." The operator locates the station and runs it.

---

## The Disposition Engine (the mechanism)

Every input runs through the same engine: **locate the station → apply that station's rule → emit a disposition + a drafted artifact + the next action + the exact pipeline write.** Before any outreach, two non-negotiable gates fire: the **Gate** (hard auto-disqualify — no phone, excluded industry, chain, out-of-lane) and the **Score** (Need 30 / Fit 25 / Reach 20 / Pay 15 / Intent 10 → grade A+→D → routing). Most leads die at the gate. That's the point.

## What it refuses to do

It will not ask you what to do with a lead · draft outreach before grading · admit a lead below the $750 floor · advance past a hard walk-away flag · invent a budget or a decision-maker · flatter a weak lead · chase a ghost past two follow-ups.

## You'll know it's working when

- Every reply ends in a **decision**, not a question.
- The drafted artifact is ready to send — you edit a name and go.
- Bad-fit leads get **declined with a warm, specific draft**, not advanced.
- The whale ($25K+) gets **escalated**, not killed; the unreachable A-grade gets **flagged**, not advanced.
- You stop spending your morning on triage.

---

*Weekly Competition #7 — The Operator. Built on interpretable context methodology: folders as architecture, each file one job, decision logic encoded explicitly. Grounded in a live studio pipeline, not a hypothetical.*
