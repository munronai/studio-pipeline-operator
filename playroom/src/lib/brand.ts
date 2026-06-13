/**
 * THE PIPELINE OPERATOR — centralized brand + product tokens.
 *
 * Everything that names or styles the product lives here so a rename or
 * re-skin is a single-file edit. The underlying operator is the folder one
 * level up (../CLAUDE.md, ../identity.md, ../rules.md, ../reference/).
 * This app is just a surface over it.
 */

export const BRAND = {
  name: "The Pipeline Operator",
  wordmark: "PIPELINE OPS",
  tagline: "It decides, drafts, and routes.",
  oneLiner:
    "A sales-pipeline operator for a diagnostic-first studio. Paste a lead at any stage — it decides the disposition, drafts the next action, and writes the CRM update.",
  category: "Sales Pipeline Operator",
  siteUrl: "https://the-pipeline-operator.vercel.app",
  built: "Built on Interpretable Context Methodology — the folder is the agent, this is just a surface.",
} as const;

/**
 * The 5-signal scoring rubric — the operator's domain artifact (replaces the
 * researcher's source tiers). This is how a lead earns a grade.
 */
export type SignalId = "need" | "fit" | "reach" | "pay" | "intent";

export type SignalMeta = {
  id: SignalId;
  label: string;
  weight: number; // percent
  hex: string;
  reads: string; // what the signal reads
};

export const SIGNALS: Record<SignalId, SignalMeta> = {
  need: {
    id: "need",
    label: "Need",
    weight: 30,
    hex: "#1a7f4b",
    reads: "How badly they need what we sell — missing/weak site, no booking, visible gaps.",
  },
  fit: {
    id: "fit",
    label: "ICP Fit",
    weight: 25,
    hex: "#2f6df6",
    reads: "Local service business, right size (not chain, not solo hobby), right vertical.",
  },
  reach: {
    id: "reach",
    label: "Reach",
    weight: 20,
    hex: "#9a6a14",
    reads: "Can we reach the decision-maker — phone works, owner named, responsive.",
  },
  pay: {
    id: "pay",
    label: "Pay",
    weight: 15,
    hex: "#6e6e6e",
    reads: "Signals they can afford $750+ — established, busy, multiple employees.",
  },
  intent: {
    id: "intent",
    label: "Intent",
    weight: 10,
    hex: "#9a6a14",
    reads: "Want to grow now — hiring, expanding, recent investment, seasonal surge.",
  },
};

export const SIGNAL_ORDER: SignalId[] = ["need", "fit", "reach", "pay", "intent"];

/** The grade scale A+→D, and how each grade routes. */
export type GradeMeta = {
  code: string;
  band: string; // composite range
  hex: string;
  soft: string;
  route: string; // where the grade sends the lead
};

export const GRADES: GradeMeta[] = [
  { code: "A+", band: "≥ 90", hex: "#1a7f4b", soft: "#ecf4ef", route: "Call first — best ROI, draft the call angle now." },
  { code: "A", band: "80–89", hex: "#1a7f4b", soft: "#ecf4ef", route: "Call first — prioritize, draft the call angle." },
  { code: "B", band: "65–79", hex: "#2f6df6", soft: "#eef3ff", route: "Calling rotation — draft outreach, queue it." },
  { code: "C", band: "50–64", hex: "#9a6a14", soft: "#f6f0e3", route: "Nurture — draft the low-cost touch, don't spend a call." },
  { code: "D", band: "< 50", hex: "#c23934", soft: "#f8ecec", route: "Nurture only — never warm-pitch a D." },
];

/**
 * Dispositions — the verbs the operator routes a lead to. Used wherever the
 * old "bands" were, to color a disposition state.
 */
export type DispositionId = "advance" | "escalate" | "refer" | "decline" | "kill";

export type DispositionMeta = {
  id: DispositionId;
  label: string;
  hex: string;
  soft: string;
  note: string;
};

export const DISPOSITIONS: Record<DispositionId, DispositionMeta> = {
  advance: { id: "advance", label: "ADVANCE", hex: "#1a7f4b", soft: "#ecf4ef", note: "Clears the gate, grade earns a touch — draft it and move the stage." },
  escalate: { id: "escalate", label: "ESCALATE", hex: "#2f6df6", soft: "#eef3ff", note: "The whale ($25K+). Route to diagnostic, flag for the human, name Substrate." },
  refer: { id: "refer", label: "REFER", hex: "#9a6a14", soft: "#f6f0e3", note: "Legit need, below the $750 floor or off-lane — refer it, don't discount." },
  decline: { id: "decline", label: "DECLINE", hex: "#c23934", soft: "#f8ecec", note: "Hard walk-away flag fired. Stop the line, draft the warm decline." },
  kill: { id: "kill", label: "KILL", hex: "#6e6e6e", soft: "#f4f4f4", note: "Failed the gate. No draft — the gate reason is the disposition." },
};

export const DISPOSITION_ORDER: DispositionId[] = ["advance", "escalate", "refer", "decline", "kill"];

/** The operator modes — selectable in the workspace. */
export type ModeId = "run" | "duel";

export type ModeMeta = {
  id: ModeId;
  glyph: string;
  label: string;
  subtitle: string;
  blurb: string;
  hex: string;
  placeholder: string;
  starter: string; // seeds the chat input
  maxTokens: number;
};

export const MODES: Record<ModeId, ModeMeta> = {
  run: {
    id: "run",
    glyph: "▸",
    label: "Run a lead",
    subtitle: "Decide, draft, route.",
    blurb:
      "Paste a lead at any stage — a scraped business, a reply, qualifier answers, a proposal gone quiet. The operator gates it, grades it, and hands back the disposition with the next action already drafted.",
    hex: "#0a0a0a",
    placeholder:
      "Paste a lead. e.g. \"Summit Roofing — no website, 47 Google reviews (4.7★), owner Dave listed, currently hiring.\"",
    starter: "New lead: ",
    maxTokens: 1800,
  },
  duel: {
    id: "duel",
    glyph: "⊟",
    label: "Duel",
    subtitle: "Generic AI vs the operator.",
    blurb:
      "Same lead, two minds. A generic assistant hands back options and asks what to do; the operator decides, drafts the artifact, and writes the pipeline update.",
    hex: "#2f6df6",
    placeholder:
      "Paste the lead both columns will work. e.g. \"New lead: Apex HVAC, 220 reviews, decent site.\"",
    starter: "New lead: ",
    maxTokens: 1600,
  },
};

export const MODE_ORDER: ModeId[] = ["run", "duel"];
