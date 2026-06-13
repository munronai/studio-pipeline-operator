import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // PIPELINE OPS — clean, modern, premium enterprise CRM (Onyx ▸ Enterprise).
        // Surfaces
        paper: "#ffffff", //  cards / panels
        bg: "#fafafa", //     app background
        sunken: "#f4f4f4", // inset / track / muted fill
        // Text
        ink: {
          DEFAULT: "#0a0a0a", // primary text + neutral-ink primary button
          soft: "#2e2e2e", //   secondary text
        },
        muted: "#6e6e6e", //  tertiary text
        faint: "#9a9a9a", //  quaternary / placeholder
        // Borders
        line: {
          DEFAULT: "#e8e8e8", // hairline
          strong: "#d8d8d8", // stronger divider
        },
        // Semantic — grade / disposition states
        advance: { DEFAULT: "#1a7f4b", soft: "#ecf4ef" }, // success / advance
        flag: { DEFAULT: "#9a6a14", soft: "#f6f0e3" }, //    warning / flag
        decline: { DEFAULT: "#c23934", soft: "#f8ecec" }, // critical / decline
        // Single restrained accent for primary actions
        accent: { DEFAULT: "#2f6df6", soft: "#eef3ff" },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "Consolas", "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Clean modern — 6px cards
        card: "6px",
      },
      boxShadow: {
        // Soft, tight enterprise shadows
        sm: "0 1px 2px rgba(10,10,10,.05)",
        md: "0 4px 12px -2px rgba(10,10,10,.09)",
        lift: "0 8px 24px -6px rgba(10,10,10,.12)",
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
