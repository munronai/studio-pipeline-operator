"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-[0.95rem]";
  return (
    <Link href="/" className="inline-flex items-center gap-2 group no-underline">
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-ink text-white shrink-0"
        aria-hidden
      >
        <span className="font-mono font-bold text-[0.7rem] leading-none">▸</span>
      </span>
      <span
        className={`font-mono font-semibold tracking-tightish text-ink ${dim} group-hover:text-accent transition-colors`}
      >
        {BRAND.wordmark}
      </span>
    </Link>
  );
}

export function Nav({ active }: { active?: "home" | "try" }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-sm bg-bg/85 border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Wordmark />
        <nav className="flex items-center gap-1 sm:gap-2 text-[0.8rem]">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-card transition-colors no-underline ${
              active === "home"
                ? "text-ink font-semibold"
                : "text-muted hover:text-ink"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/try"
            className={`px-3 py-1.5 rounded-card border transition-all no-underline font-medium ${
              active === "try"
                ? "bg-ink text-white border-ink"
                : "border-line text-ink hover:bg-sunken"
            }`}
          >
            Open workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
