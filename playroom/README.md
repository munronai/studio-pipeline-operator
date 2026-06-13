# Playroom — The Pipeline Operator (live demo)

A single-file, **no-build** product page with a working **Live Deal Desk**.

## Run it

Double-click `index.html`. That's it. No npm, no install, no server, no build step. It also runs unchanged on GitHub Pages.

## What it is

A SaaS product page for **The Pipeline Operator** with an interactive console where you run a real lead through the operator's actual decision engine — in your browser, no backend.

Pick a preset chip or fill the form, hit **RUN**, and the page:

1. **Gates** the lead (hard auto-disqualify — excluded industry, no phone, retail/food, out-of-lane). A gated lead renders a **KILL** panel, no score.
2. **Scores** it — five weighted dimensions (Need 30 / Fit 25 / Reach 20 / Pay 15 / Intent 10), rendered as clean animated progress bars, with the composite and a grade pill.
3. **Routes** by grade (A/A+ call-first · B rotation · C/D nurture) and picks the outreach **angle**.
4. Emits the full **output shape**: WHERE · DISPOSITION · ARTIFACT (paste-ready draft) · NEXT ACTION + DUE · PIPELINE UPDATE · FLAGS.

The edge cases all fire faithfully: the whale **escalates** (not declines), the $400 lead is **referred** (below floor), the haggler is **declined** (pricing-pressure), the excluded industry is **killed** at the gate.

## How it was built

Built with the open-design **`saas-landing`** skill applied to the **`apple`** design system (modern / premium — clean light canvases, generous whitespace, big bold display typography, pill-shaped CTAs, one confident blue accent). The system font stack (`-apple-system`/SF Pro) leads with **Inter** loaded via Google Fonts as the fallback. Surfaces alternate white `#FFFFFF` and pale `#F5F5F7` bands, with one cinematic black `#000000` footer CTA section. The blue accent (`#0071E3`) is disciplined to links, the primary CTA, and a few highlights; the green / amber / red semantic colors appear **only** inside the live demo for grade and disposition states.

The content and the demo's logic are **grounded in the operator folder** (`../`) — the gate (`reference/gate-checklist.md`), the 5-dimension rubric (`reference/scoring-rubric.md`), the 7 walk-away flags (`reference/walk-away-flags.md`), the field taxonomy (`reference/pipeline-fields.md`), and the drafted artifacts (`reference/outreach-templates.md`). The page is a faithful reimplementation, not a mock.

## The folder is the real product

This page is one way to *watch the operator run*. The operator itself is the folder one level up — `studio-pipeline-operator/`. Drop that folder into a Claude Project and Claude becomes the studio's pipeline desk. Built on interpretable context methodology: folders as architecture, each file one job, decision logic encoded explicitly.

## Self-contained

No external JS libraries, no CDNs, no frameworks. Vanilla JS, inlined. The only network request is a single Google Fonts `<link>`, with full system-font fallbacks if it's offline.
