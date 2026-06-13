# Deploying The Pipeline Operator

This app is the **visual surface** for The Pipeline Operator. The operator itself is the markdown
folder one level up (`../CLAUDE.md`, `../identity.md`, `../rules.md`, `../reference/`). The app reads
those files **at request time** (via the committed `.operator/` mirror) and feeds them to Claude as
the system prompt — so the app is never out of sync with the folder. Edit a rule in `../rules.md`,
redeploy, and the behavior changes. **The folder is the agent; this is just a surface.**

---

## Run it locally

```bash
cd playroom
npm install
cp .env.local.example .env.local      # then paste your Anthropic key into .env.local
npm run dev                            # http://localhost:3000
```

`npm run dev` runs `scripts/sync-operator.mjs` first (predev), which mirrors `../` into `.operator/`
so the function is self-contained. You need an Anthropic API key from
https://console.anthropic.com/. It is read **server-side only** (in the API route) and is never
exposed to the browser.

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo.
3. **Root Directory:** set it to `playroom` (the app is not at repo root — the operator folder is).
4. Framework preset auto-detects **Next.js**. Leave build/install commands as-is.
5. **Environment Variables** → add `ANTHROPIC_API_KEY`. (Optional: `ANTHROPIC_MODEL`,
   `ANTHROPIC_DUEL_MODEL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.)
6. Deploy.

> The committed `.operator/` mirror ships with the deployment, and `next.config.mjs`
> (`outputFileTracingIncludes`) bundles it into the `/api/research` function — so the system prompt
> is available at runtime regardless of how the project is rooted.

CLI alternative:

```bash
cd playroom
vercel            # first run links the project
vercel --prod     # production deploy
# set the key once:
vercel env add ANTHROPIC_API_KEY
```

---

## The guardrails (why this is safe to make public)

The key is shared across everyone who hits the public URL, so cost is controlled at every layer:

| Guardrail | Where | Default |
|-----------|-------|---------|
| **Server-side key only** | `src/app/api/research/route.ts` | never sent to the client |
| **Low-cost model** | `MODEL` | `claude-haiku-4-5` (override with `ANTHROPIC_MODEL`) |
| **Sharper model for the duel** | `DUEL_MODEL` | `claude-sonnet-4-5` (override with `ANTHROPIC_DUEL_MODEL`) |
| **Per-mode output cap** | `MAX_TOKENS` | run 1800 · duel 1600 (sized so a full disposition fits) |
| **Per-IP rate limit** | in-memory token bucket | 12 req / 60s (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`) |
| **Input caps** | message count / length / total | 24 msgs · 4k chars/msg · 16k total |
| **Prompt caching** | `cache_control: ephemeral` on the system prompt | constitution cached between turns |

For a sharper private instance: set `ANTHROPIC_MODEL=claude-sonnet-4-5`, raise the token caps, and
loosen the rate limit.

---

## What's where

```
playroom/
├── src/app/page.tsx              ← the animated overview
├── src/app/try/page.tsx          ← the workspace (Run a lead · Duel · Pipeline)
├── src/app/api/research/route.ts ← the secure streaming route + guardrails
├── src/lib/operator-context.ts   ← reads ../ folder → system prompt (mode-aware: run | duel)
├── src/lib/brand.ts              ← all product naming + signals + grades + modes (rename = one edit)
├── src/lib/lead-scenarios.ts     ← the 5 canned leads for the duel
└── src/components/               ← LiveDuel · Chat · PipelineBoard · Markdown · RubricLegend
```
