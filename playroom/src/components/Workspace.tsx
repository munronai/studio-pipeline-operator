"use client";

import { useState } from "react";
import Link from "next/link";
import { LiveDuel } from "./LiveDuel";
import { Chat } from "./Chat";
import { PipelineWorkspace } from "./pipeline/PipelineWorkspace";

type Tab = "run" | "duel" | "pipeline";

const TABS: { id: Tab; label: string; glyph: string; tagline: string }[] = [
  { id: "run", label: "Run a lead", glyph: "▸", tagline: "Paste a lead. Get a disposition + the drafted next action." },
  { id: "duel", label: "Duel", glyph: "⊟", tagline: "Generic AI vs the operator, same lead." },
  { id: "pipeline", label: "Pipeline board", glyph: "≣", tagline: "The live Kanban — run a lead and watch the card drop in." },
];

export function Workspace({ initial = "run" }: { initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex gap-1 p-1 rounded-card bg-sunken border border-line w-fit">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded font-medium text-[0.8rem] transition-all ${
                  on ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                <span className="mr-1.5 font-mono text-[0.72rem]">{t.glyph}</span>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="text-[0.78rem] text-muted">{active.tagline}</div>
      </div>

      {tab === "run" && <Chat />}
      {tab === "duel" && <LiveDuel />}
      {tab === "pipeline" && (
        <div className="space-y-3">
          <PipelineWorkspace />
          <div className="text-[0.74rem] text-muted">
            Want the board full-width with more room?{" "}
            <Link href="/board" className="text-indigo font-medium hover:underline">
              Open the dedicated live board ↗
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
