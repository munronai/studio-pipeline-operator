import type { Metadata } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

const SITE_URL = BRAND.siteUrl;
const TITLE = `${BRAND.name} — ${BRAND.category}`;
const DESCRIPTION =
  "The Pipeline Operator is a sales-pipeline operator for a diagnostic-first solo digital studio. Paste a lead at any stage — a scraped business, a reply, qualifier answers, a stalled proposal — and it decides the disposition, drafts the next action (call angle, email, decline, proposal skeleton), and writes the exact CRM update. It gates and grades every lead, escalates the whale, refers the sub-floor lead, and declines on a hard walk-away flag. Built on Interpretable Context Methodology.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "sales pipeline operator",
    "lead disposition",
    "CRM automation",
    "lead scoring",
    "sales triage",
    "digital studio sales",
    "Interpretable Context Methodology",
    "ICM",
    "EDUBA",
    "Cleaf Notes",
    "Claude",
    "Anthropic",
  ],
  authors: [{ name: "griffainai" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-ink font-sans">{children}</body>
    </html>
  );
}
