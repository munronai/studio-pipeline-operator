"use client";

/**
 * MarkdownLite — a dependency-free renderer tuned for the operator's output.
 *
 * It handles the subset the operator actually emits: bold section headers
 * (WHERE / DISPOSITION / ARTIFACT / NEXT ACTION + DUE / PIPELINE UPDATE / FLAGS),
 * ## / ### headings, bullet lists, and paragraphs. Inline `code` (the pipeline
 * field writes, e.g. `stage: contacted · grade: B+`) renders as a mono field
 * chip. Disposition verbs (ADVANCE / ESCALATE / REFER / DECLINE / KILL) and the
 * FLAGS header get a semantic color rail.
 */

import React from "react";

/* Disposition verb → semantic color (for the DISPOSITION line accent). */
const DISPO_COLORS: { re: RegExp; hex: string }[] = [
  { re: /\bADVANCE\b/, hex: "#1a7f4b" },
  { re: /\bESCALATE\b/, hex: "#2f6df6" },
  { re: /\bREFER\b/, hex: "#9a6a14" },
  { re: /\bDECLINE\b/, hex: "#c23934" },
  { re: /\bKILL\b/, hex: "#6e6e6e" },
];

function dispoColor(text: string): string | null {
  for (const d of DISPO_COLORS) if (d.re.test(text)) return d.hex;
  return null;
}

/** Render a single line of inline text. Emphasis (**bold** / *italic* / `code`). */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((p, idx) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyBase}-b${idx}`} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.length > 2 && p.startsWith("*") && p.endsWith("*")) {
      return (
        <em key={`${keyBase}-i${idx}`} className="italic text-ink-soft">
          {p.slice(1, -1)}
        </em>
      );
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={`${keyBase}-c${idx}`} className="field-chip mx-0.5">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={`${keyBase}-x${idx}`}>{p}</React.Fragment>;
  });
}

function headerKind(text: string): "decline" | "flag" | "dispo" | "plain" {
  if (/^FLAGS?\b/i.test(text)) return "flag";
  if (/^DISPOSITION\b/i.test(text)) return "dispo";
  if (/DECLINE|KILL/i.test(text)) return "decline";
  return "plain";
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let key = 0;

  function flushList() {
    if (listBuf.length === 0) return;
    const items = [...listBuf];
    listBuf = [];
    blocks.push(
      <ul key={`ul-${key++}`} className="my-2 space-y-1 pl-1">
        {items.map((it, idx) => (
          <li key={idx} className="flex gap-2 text-[0.9rem] leading-relaxed text-ink-soft">
            <span className="text-accent mt-1 select-none text-[0.7rem]">▪</span>
            <span>{renderInline(it, `li-${key}-${idx}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (/^\s*[-*•]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      listBuf.push(line.replace(/^\s*([-*•]|\d+\.)\s+/, ""));
      continue;
    }
    flushList();

    if (line.trim() === "") {
      blocks.push(<div key={`sp-${key++}`} className="h-2" />);
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const txt = h[2].replace(/\*\*/g, "");
      blocks.push(
        <h3 key={`h-${key++}`} className="font-semibold text-ink mt-3 mb-1 text-[1rem] tracking-tighter2">
          {renderInline(txt, `h-${key}`)}
        </h3>
      );
      continue;
    }

    // A bold-only line acts as a section header (WHERE, DISPOSITION, etc.)
    const boldHeader = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldHeader) {
      const txt = boldHeader[1];
      const kind = headerKind(txt);
      const hex = kind === "flag" || kind === "decline" ? "#c23934" : "#6e6e6e";
      const rail = kind === "flag" || kind === "decline";
      blocks.push(
        <div
          key={`bh-${key++}`}
          className={`mt-3 mb-1 font-mono font-semibold uppercase tracking-wider text-[0.72rem] ${
            rail ? "kill-snap pl-2 border-l-2" : ""
          }`}
          style={{ color: hex, borderColor: rail ? "#c23934" : undefined }}
        >
          {txt}
        </div>
      );
      continue;
    }

    // DISPOSITION line that leads with **ADVANCE → …** mid-line: color the verb.
    const dc = dispoColor(line);
    blocks.push(
      <p
        key={`p-${key++}`}
        className="text-[0.9rem] leading-relaxed text-ink-soft"
        style={dc ? { borderLeft: `2px solid ${dc}`, paddingLeft: "0.5rem" } : undefined}
      >
        {renderInline(line, `p-${key}`)}
      </p>
    );
  }
  flushList();

  return <div className="space-y-0.5 text-left">{blocks}</div>;
}
