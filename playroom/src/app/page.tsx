import Link from "next/link";
import { Nav } from "@/components/Nav";
import { DemoHero } from "@/components/DemoHero";
import { LiveDuel } from "@/components/LiveDuel";
import { Workspace } from "@/components/Workspace";
import { RubricLegend } from "@/components/RubricLegend";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="home" />

      {/* 1 — the animated overview */}
      <DemoHero />

      {/* 2 — the live duel */}
      <Section id="duel" tone="panel">
        <Eyebrow>The proof · live</Eyebrow>
        <H2>Same lead. Two minds.</H2>
        <Lede>
          Pick a lead, hit run, and watch a normal AI and the operator take the <em>same</em> input
          side by side. One dumps options and asks what you want to do. The other gates it, grades
          it, commits to a disposition, and drafts the artifact. This is the whole pitch in ten
          seconds.
        </Lede>
        <div className="mt-7">
          <LiveDuel />
        </div>
      </Section>

      {/* 3 — run it yourself */}
      <Section id="workspace">
        <Eyebrow>Run it yourself</Eyebrow>
        <H2>Paste a lead. Get a disposition — not options.</H2>
        <Lede>
          The Disposition Engine, made interactive. Paste a scraped business, a reply, a set of
          qualifier answers, or a stalled proposal. Watch it gate the lead, score it on five
          signals, decide where it routes, and draft the next action — the call script, the email,
          or the decline. There&apos;s a pipeline map too.
        </Lede>
        <div className="mt-7">
          <Workspace initial="run" />
        </div>
      </Section>

      {/* 4 — what you get */}
      <Section tone="panel">
        <Eyebrow>What you get</Eyebrow>
        <H2>The same output shape. Every lead, every time.</H2>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <Feature n="01" title="The disposition" body="The decision stated first — ADVANCE, ESCALATE, REFER, DECLINE, or KILL — with the rule that fired and the grade." />
          <Feature n="02" title="The artifact" body="The drafted thing, ready to send: the cold-call angle + script, the email, the booking ask, the proposal skeleton, the decline. Real words." accent />
          <Feature n="03" title="Next action + due" body="The single next move and exactly when it's due. No ambiguity about what happens next." />
          <Feature n="04" title="The pipeline update" body="The exact field writes — stage, grade, outcome, decline reason — in the real CRM taxonomy. Nothing invented." />
          <Feature n="05" title="The flags" body="Anything escalated to you, with the reason and the one open question. A flag is a decision that this call belongs to the human." flag />
          <Feature n="06" title="The refusals" body="It won't flatter a lead, draft before grading, admit a sub-floor lead, or chase a ghost forever. The discipline is the value." accent />
        </div>
      </Section>

      {/* 5 — the scoring rubric */}
      <Section>
        <Eyebrow>The domain edge</Eyebrow>
        <H2>Every lead earns its grade on five signals.</H2>
        <Lede>
          A generic assistant calls every lead &ldquo;a great opportunity.&rdquo; The operator
          can&apos;t — it gates first, then scores Need, Fit, Reach, Pay, and Intent on a weighted
          rubric, and the grade decides whether the lead gets a call, a queue slot, or a nurture
          touch. Need outranks fit; fit outranks everything else.
        </Lede>
        <div className="mt-7 max-w-3xl">
          <RubricLegend />
        </div>
      </Section>

      {/* 6 — the folder, explained plainly */}
      <Section tone="panel">
        <Eyebrow>What makes it different under the hood</Eyebrow>
        <H2>Its brain is a folder you can read.</H2>
        <Lede>
          Most AI tools are a black box — you can&apos;t see <em>why</em> they answer the way they
          do. This is the opposite. Every rule the operator follows — the gate, the rubric, the six
          stations, the walk-away flags, the pipeline taxonomy — lives in a folder of plain-English
          files. Open it, change a rule, and it follows the new rule on the next lead. This website
          is just a window into that folder.
        </Lede>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <Surface
            tag="You can see why"
            title="Nothing is hidden"
            body="Read exactly why it graded a lead B and routed it to the calling rotation. The logic isn't buried in a model — it's written down in files anyone can open."
          />
          <Surface
            tag="You can make it yours"
            title="Tune it to your pipeline"
            body="Different floor, different tiers, a different vertical? Edit the files — the gate, the rubric, the walk-away flags — and it becomes your operator, not a generic one."
            accent
          />
          <Surface
            tag="It goes anywhere"
            title="No app required"
            body="The folder works on its own: drop it into any capable AI and it runs — no install, no setup. This site just makes it nicer to use."
          />
        </div>
      </Section>

      {/* 7 — closing CTA */}
      <Section tone="dark" center>
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-card bg-white text-ink glow-pulse font-mono text-xl">▸</span>
        </div>
        <h2 className="display-tagline size-large text-white">{BRAND.tagline}</h2>
        <p className="text-white/70 max-w-xl mx-auto mt-4 leading-relaxed">
          Stop deciding what to do with every lead. Paste it. The operator decides, drafts, and routes.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <a href="#duel" className="cta-btn cta-accent">Run the duel</a>
          <Link href="/try" className="cta-btn">Open the workspace</Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
}

/* ---------------- layout primitives ---------------- */
type Tone = "default" | "panel" | "dark";

function Section({
  id, children, tone = "default", center = false,
}: {
  id?: string; children: React.ReactNode; tone?: Tone; center?: boolean;
}) {
  const bg = tone === "dark" ? "bg-ink text-white" : tone === "panel" ? "bg-sunken" : "bg-bg";
  return (
    <section id={id} className={`scroll-mt-16 border-t border-line ${bg}`}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 ${center ? "text-center" : ""}`}>
        {children}
      </div>
    </section>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-3">{children}</div>;
}
function H2({ children, tone = "default" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <h2 className={`font-semibold tracking-tighter2 size-medium ${tone === "dark" ? "text-white" : "text-ink"}`}>
      {children}
    </h2>
  );
}
function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 max-w-2xl text-[0.95rem] sm:text-base leading-relaxed text-muted">{children}</p>
  );
}

function Feature({
  n, title, body, accent, flag,
}: {
  n: string; title: string; body: string; accent?: boolean; flag?: boolean;
}) {
  const hex = flag ? "#c23934" : accent ? "#2f6df6" : "#0a0a0a";
  return (
    <div className="bg-paper border border-line rounded-card p-5 shadow-sm">
      <div className="font-mono font-semibold text-lg tabular-nums" style={{ color: hex }}>{n}</div>
      <div className="font-semibold text-ink mt-1 text-[1.05rem]">{title}</div>
      <p className="text-[0.85rem] text-muted mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function Surface({
  tag, title, body, accent,
}: {
  tag: string; title: string; body: string; accent?: boolean;
}) {
  const hex = accent ? "#2f6df6" : "#6e6e6e";
  return (
    <div className="bg-paper border border-line rounded-card p-5 shadow-sm">
      <div className="eyebrow" style={{ color: hex }}>{tag}</div>
      <div className="font-semibold text-ink mt-1.5 text-[1.1rem]">{title}</div>
      <p className="text-[0.85rem] text-muted mt-2 leading-relaxed">{body}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-[0.85rem]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="font-mono font-semibold text-white text-[0.95rem] tracking-tightish">
            ▸ {BRAND.wordmark}
          </div>
          <div className="flex gap-4 font-mono text-[0.7rem] uppercase tracking-wider">
            <a href="#duel" className="hover:text-white transition-colors">Duel</a>
            <a href="#workspace" className="hover:text-white transition-colors">Run a lead</a>
            <Link href="/try" className="hover:text-white transition-colors">Workspace</Link>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-white/60 leading-relaxed">
          {BRAND.name} — a sales-pipeline operator for a diagnostic-first solo digital studio. Instead
          of handing back options, it decides each lead&apos;s disposition, drafts the next action,
          and writes the exact CRM update — gating and grading every lead, escalating the whale,
          referring the sub-floor lead, and declining on a hard walk-away flag.
        </p>
        <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-wider text-white/40">
          Built on Interpretable Context Methodology · Submission for Weekly Comp #7 — The Operator ·
          Cleaf Notes / EDUBA
        </p>
      </div>
    </footer>
  );
}
