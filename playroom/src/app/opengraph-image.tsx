import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Pipeline Operator — It decides, drafts, and routes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafafa",
          padding: "70px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top row: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#0a0a0a",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            ▸
          </div>
          <div style={{ color: "#0a0a0a", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            PIPELINE OPS
          </div>
        </div>

        {/* middle: tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#2f6df6", fontSize: 26, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>
            Sales Pipeline Operator
          </div>
          <div style={{ display: "flex", color: "#0a0a0a", fontSize: 74, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
            It decides, drafts, and routes.
          </div>
        </div>

        {/* bottom: duel chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#6e6e6e",
              border: "1px solid #d8d8d8",
              background: "#fff",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 22,
            }}
          >
            Generic AI → dumps options, asks you what to do
          </div>
          <div style={{ color: "#9a9a9a", fontSize: 26, fontWeight: 700 }}>vs</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#fff",
              background: "#0a0a0a",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            ▸ The Operator → decides, drafts, routes
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
