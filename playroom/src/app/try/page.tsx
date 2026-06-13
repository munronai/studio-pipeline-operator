import { Nav } from "@/components/Nav";
import { Workspace } from "@/components/Workspace";
import { BRAND } from "@/lib/brand";

export default function TryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="try" />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="font-semibold text-2xl sm:text-3xl text-ink tracking-tighter2">
            The workspace
          </h1>
          <p className="text-[0.9rem] text-muted mt-1 max-w-2xl leading-relaxed">
            {BRAND.tagline} — three ways to use it. The operator&apos;s brain is a folder of
            plain-English files; this is just a window into it.
          </p>
        </div>
        <Workspace initial="run" />
        <footer className="mt-10 pt-5 border-t border-line text-[0.75rem] text-faint font-mono leading-relaxed">
          <p>
            Public demo on a shared key — runs on a fast, low-cost model with tight limits, so
            answers are intentionally short. Fork it and point it at Sonnet (or your own pipeline)
            for the sharp version.
          </p>
          <p className="mt-1">{BRAND.built}</p>
        </footer>
      </main>
    </div>
  );
}
