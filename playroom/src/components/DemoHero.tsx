"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTypewriter } from "@/lib/useTypewriter";
import { BRAND } from "@/lib/brand";

/* The story: a studio founder drowning in leads → generic AI defers → the
   operator decides → how (gate + grade) → how (decide + draft + route) →
   what you get → watch it live. */
const SCENE_DURATIONS_MS = [4400, 7500, 8500, 7500, 8500, 8500, 8000, 99999];
const SCENE_COUNT = SCENE_DURATIONS_MS.length;

export function DemoHero() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(SCENE_COUNT - 1, next));
    setScene(clamped);
    if (clamped === SCENE_COUNT - 1) setDone(true);
  }, []);

  useEffect(() => {
    if (paused || scene >= SCENE_COUNT - 1) return;
    timerRef.current = window.setTimeout(() => go(scene + 1), SCENE_DURATIONS_MS[scene]);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scene, paused, go]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!rootRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
      if (!inView) return;
      if (e.key === "ArrowRight") go(scene + 1);
      else if (e.key === "ArrowLeft") go(scene - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, go]);

  return (
    <div ref={rootRef} className="flex flex-col" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <main className="flex-1 relative flex items-center justify-center px-5 py-10">
        <div key={scene} className="scene-fade-up w-full max-w-4xl">
          <SceneRouter scene={scene} />
        </div>
      </main>
      <Controls
        scene={scene}
        paused={paused}
        done={done}
        onPause={() => setPaused((p) => !p)}
        onPrev={() => go(scene - 1)}
        onNext={() => go(scene + 1)}
        onRestart={() => {
          setDone(false);
          setPaused(false);
          go(0);
        }}
      />
    </div>
  );
}

function SceneRouter({ scene }: { scene: number }) {
  switch (scene) {
    case 0: return <SceneCold />;
    case 1: return <SceneProblem />;
    case 2: return <SceneGeneric />;
    case 3: return <SceneBigIdea />;
    case 4: return <SceneGate />;
    case 5: return <SceneDraft />;
    case 6: return <SceneOutput />;
    default: return <SceneClose />;
  }
}

/* ---------- 0: cold open — say what it IS ---------- */
function SceneCold() {
  return (
    <div className="text-center stagger">
      <div style={{ animationDelay: "0ms" }} className="flex justify-center mb-6">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-card bg-ink text-white glow-pulse font-mono text-2xl">▸</span>
      </div>
      <h1 style={{ animationDelay: "150ms" }} className="display-tagline size-mega">{BRAND.name}</h1>
      <p style={{ animationDelay: "400ms" }} className="size-medium font-semibold text-accent mt-3">
        {BRAND.tagline}
      </p>
      <p style={{ animationDelay: "750ms" }} className="text-muted text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
        Paste a sales lead at any stage. It hands back the{" "}
        <span className="text-ink font-semibold">decision already made</span> and the next move already drafted —
        not a question bounced back to you.
      </p>
    </div>
  );
}

/* ---------- 1: the problem ---------- */
function SceneProblem() {
  const { out, done } = useTypewriter("40–60 leads a week. The selling isn't what kills you.", { speed: 32 });
  return (
    <div className="text-center">
      <div className="eyebrow mb-4">The problem every solo founder has</div>
      <p className={`size-large font-semibold text-ink ${!done ? "caret" : ""}`}>{out}</p>
      <div className="stagger mt-8 text-muted text-base sm:text-lg max-w-2xl mx-auto space-y-3 leading-relaxed">
        <p style={{ animationDelay: "2200ms" }}>
          A scraped business, a one-line reply, a set of qualifier answers, a proposal that went
          quiet — dozens of leads, all at different stages, all needing a decision.
        </p>
        <p style={{ animationDelay: "3000ms" }} className="text-accent font-semibold">
          The triage and the follow-through is the work. That&apos;s what rots the pipeline.
        </p>
      </div>
    </div>
  );
}

/* ---------- 2: generic AI defers ---------- */
function SceneGeneric() {
  return (
    <div className="stagger">
      <div style={{ animationDelay: "0ms" }} className="eyebrow mb-4 text-center">
        So you ask a normal AI what to do with one…
      </div>
      <div style={{ animationDelay: "300ms" }} className="mock-bubble-prompt max-w-2xl mx-auto mb-3">
        &gt; New lead: Summit Roofing — no website, 47 reviews, owner listed, hiring. What do I do?
      </div>
      <div style={{ animationDelay: "900ms" }} className="mock-bubble max-w-2xl mx-auto text-[0.92rem] leading-relaxed">
        Summit Roofing looks like <Mark c="#6e6e6e" dashed>a great opportunity!</Mark> You could{" "}
        <Mark c="#9a6a14">pitch a full site, offer a landing page, or set up their booking</Mark>.{" "}
        <Mark c="#c23934">Which would you like to pursue? I&apos;m happy to draft whichever you choose.</Mark>
      </div>
      <div style={{ animationDelay: "1600ms" }} className="flex flex-wrap justify-center gap-4 mt-5 text-[0.78rem]">
        <Legend c="#6e6e6e" t="Flatters every lead" />
        <Legend c="#9a6a14" t="Dumps options" />
        <Legend c="#c23934" t="Kicks the decision back to you" />
      </div>
      <p style={{ animationDelay: "2300ms" }} className="text-center text-muted mt-5 max-w-xl mx-auto leading-relaxed">
        More words, zero decisions. You still have to do the thinking.
      </p>
    </div>
  );
}

/* ---------- 3: the big idea ---------- */
function SceneBigIdea() {
  const { out, done } = useTypewriter("The operator decides.", { speed: 44 });
  return (
    <div className="text-center">
      <div className="eyebrow mb-4 text-accent">Here&apos;s the difference</div>
      <p className={`size-large font-semibold text-ink ${!done ? "caret" : ""}`}>{out}</p>
      <div className="stagger mt-8 max-w-2xl mx-auto space-y-4 text-base sm:text-lg leading-relaxed">
        <p style={{ animationDelay: "1400ms" }} className="text-muted">
          It doesn&apos;t hand you options. It runs one mechanism — the Disposition Engine — and gives you a verdict:
        </p>
        <p style={{ animationDelay: "2100ms" }} className="size-medium font-semibold text-ink">
          &ldquo;This is a <span className="text-accent">B+ lead</span>. Here&apos;s the call angle. Call it Tuesday. Move it to <span className="font-mono text-[0.9em]">contacted</span>.&rdquo;
        </p>
        <p style={{ animationDelay: "3000ms" }} className="text-muted">
          The artifact is already written. You just send or call.
        </p>
      </div>
    </div>
  );
}

/* ---------- 4: how — gate + grade ---------- */
function SceneGate() {
  const { out, done } = useTypewriter("Most leads die at the gate. That's the point.", { speed: 26 });
  return (
    <div className="text-center">
      <div className="eyebrow mb-4 text-accent">How · step 1 — gate, then grade</div>
      <p className={`size-medium font-semibold text-ink max-w-3xl mx-auto ${!done ? "caret" : ""}`}>{out}</p>
      <p className="stagger text-muted mt-5 max-w-xl mx-auto leading-relaxed">
        <span style={{ animationDelay: "2600ms" }}>A lead that clears the gate gets scored on five weighted signals:</span>
      </p>
      <div className="stagger flex flex-wrap justify-center gap-2.5 mt-5 max-w-3xl mx-auto">
        {[
          ["Need", "30%"],
          ["ICP Fit", "25%"],
          ["Reach", "20%"],
          ["Pay", "15%"],
          ["Intent", "10%"],
        ].map(([c, w], i) => (
          <span
            key={c}
            style={{ animationDelay: `${3000 + i * 300}ms` }}
            className="px-3.5 py-1.5 rounded-card bg-paper border border-line shadow-sm font-mono text-[0.82rem] font-semibold text-ink"
          >
            {c} <span className="text-muted font-normal">{w}</span>
          </span>
        ))}
      </div>
      <p style={{ animationDelay: "4800ms" }} className="stagger text-muted mt-6">
        <span style={{ animationDelay: "4800ms" }}>That score becomes a grade A+→D — and the grade decides the route.</span>
      </p>
    </div>
  );
}

/* ---------- 5: how — decide, draft, route ---------- */
function SceneDraft() {
  const rows = [
    { label: "ADVANCE", hex: "#1a7f4b", body: "Clears the gate, grade earns a touch — draft it and move the stage." },
    { label: "ESCALATE", hex: "#2f6df6", body: "The whale ($25K+). Route to diagnostic, flag for the human — never decline it." },
    { label: "REFER", hex: "#9a6a14", body: "Legit need, below the $750 floor — refer it. The floor is the floor." },
    { label: "DECLINE", hex: "#c23934", body: "A hard walk-away flag fired. Stop the line, draft the warm decline." },
  ];
  return (
    <div>
      <div className="text-center mb-6">
        <div className="eyebrow mb-2 text-accent">How · step 2 — decide, draft, route</div>
        <h2 className="size-medium font-semibold text-ink">A grade isn&apos;t a verdict. The disposition is.</h2>
        <p className="text-muted mt-2 max-w-xl mx-auto leading-relaxed">It routes every lead to one of these — and writes the artifact that goes with it.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto stagger">
        {rows.map((t, i) => (
          <div key={t.label} style={{ animationDelay: `${i * 400}ms` }} className="rounded-card p-4 bg-paper border border-line shadow-sm">
            <span className="state-badge stamp-in" style={{ color: t.hex, borderColor: t.hex, background: `${t.hex}14`, animationDelay: `${i * 400 + 150}ms` }}>
              {t.label}
            </span>
            <div className="text-[0.82rem] text-ink-soft mt-2.5 leading-snug">{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 6: what you get — the output shape ---------- */
function SceneOutput() {
  const rows = [
    { k: "Disposition", v: "The decision, stated first, with the rule that fired and the grade.", hex: "#0a0a0a" },
    { k: "Artifact", v: "The drafted thing, ready to send — the call script, the email, the decline. Real words.", hex: "#2f6df6" },
    { k: "Next action + due", v: "The single next move and exactly when it's due.", hex: "#0a0a0a" },
    { k: "Pipeline update", v: "The exact field writes — stage, grade, outcome, reason — in the real taxonomy.", hex: "#1a7f4b" },
    { k: "Flags", v: "Anything escalated to you, with the reason and the one open question.", hex: "#c23934", flag: true },
  ];
  return (
    <div>
      <div className="text-center mb-5">
        <div className="eyebrow mb-2">What you walk away with</div>
        <h2 className="size-medium font-semibold text-ink">A disposition you can act on without re-deciding.</h2>
        <p className="text-muted mt-2 max-w-xl mx-auto leading-relaxed">Every response carries the same shape — the human just sends or calls.</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-2 stagger">
        {rows.map((r, i) => (
          <div
            key={r.k}
            style={{ animationDelay: `${i * 350}ms`, ...(r.flag ? { borderLeftColor: "#c23934" } : {}) }}
            className={`card p-3 flex gap-3 items-baseline ${r.flag ? "kill-snap border-l-2" : ""}`}
          >
            <span className="font-mono font-semibold text-[0.7rem] uppercase tracking-wider shrink-0 w-32" style={{ color: r.hex }}>
              {r.k}
            </span>
            <span className="text-[0.85rem] text-ink-soft">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 7: close → into the duel ---------- */
function SceneClose() {
  return (
    <div className="text-center stagger">
      <div style={{ animationDelay: "0ms" }} className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-card bg-ink text-white glow-pulse font-mono text-xl">▸</span>
      </div>
      <h2 style={{ animationDelay: "150ms" }} className="display-tagline size-large">Same lead. Two minds.</h2>
      <p style={{ animationDelay: "450ms" }} className="text-muted max-w-xl mx-auto mt-4 leading-relaxed">
        Watch a normal AI and the operator take the exact same lead — side by side, live, right
        below. One dumps options. The other decides, drafts, and routes.
      </p>
      <div style={{ animationDelay: "750ms" }} className="flex flex-wrap justify-center gap-3 mt-7">
        <a href="/board" className="cta-btn cta-accent">Open the live board ↗</a>
        <a href="#duel" className="cta-btn">See them head-to-head ↓</a>
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */
function Mark({ children, c, dashed }: { children: React.ReactNode; c: string; dashed?: boolean }) {
  return (
    <span className="rounded px-0.5" style={{ background: `${c}14`, borderBottom: `1.5px ${dashed ? "dashed" : "solid"} ${c}` }}>
      {children}
    </span>
  );
}
function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: `${c}22`, border: `1.5px solid ${c}` }} />
      <span style={{ color: c }}>{t}</span>
    </span>
  );
}

function Controls({
  scene, paused, done, onPause, onPrev, onNext, onRestart,
}: {
  scene: number; paused: boolean; done: boolean;
  onPause: () => void; onPrev: () => void; onNext: () => void; onRestart: () => void;
}) {
  const isLast = scene === SCENE_COUNT - 1;
  return (
    <div className="border-t border-line bg-bg/90 backdrop-blur-sm px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky bottom-0 z-10">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: SCENE_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === scene ? "w-6 bg-ink dot-active" : i < scene ? "w-2 bg-muted" : "w-2 bg-line-strong"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-[0.75rem] font-medium">
        <button onClick={onPrev} disabled={scene === 0} className="px-2.5 py-1.5 rounded-card border border-line text-ink-soft disabled:opacity-30 hover:bg-sunken">‹ Back</button>
        {!isLast ? (
          <button onClick={onPause} className="px-3 py-1.5 rounded-card border border-line text-ink-soft hover:bg-sunken">{paused ? "▶ Play" : "⏸ Pause"}</button>
        ) : (
          <button onClick={onRestart} className="px-3 py-1.5 rounded-card border border-ink bg-ink text-white">↻ Replay</button>
        )}
        <button onClick={onNext} disabled={isLast} className="px-2.5 py-1.5 rounded-card border border-line text-ink-soft disabled:opacity-30 hover:bg-sunken">{done && !isLast ? "Skip ›" : "Next ›"}</button>
      </div>
    </div>
  );
}
