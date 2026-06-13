import { Nav } from "@/components/Nav";
import { PipelineWorkspace } from "@/components/pipeline/PipelineWorkspace";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `Live board — ${BRAND.name}`,
  description:
    "The interactive sales pipeline. Run a lead and watch the operator decide its disposition, draft the next action, and drop the card into the right column.",
};

export default function BoardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav active="board" />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-5">
        <div className="mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-ink tracking-tighter2">
            The live pipeline
          </h1>
          <p className="text-[0.85rem] text-muted mt-1 max-w-2xl leading-relaxed">
            A working CRM board driven by the operator. Run a lead on the right — it gates, grades,
            decides the disposition, and drops the card into the right column. Click any card to open
            the full lead detail, log a call, draft an email, or move it down the funnel. State
            persists locally; hit <span className="font-mono text-ink">↺ Reset demo</span> to reseed.
          </p>
        </div>
        <PipelineWorkspace />
        <footer className="mt-8 pt-5 border-t border-line text-[0.72rem] text-faint font-mono leading-relaxed">
          <p>
            Pure client-side demo — leads live in your browser&apos;s localStorage; the dialer,
            email, and scheduler are mocked (no real calls or sends). The operator run is live on a
            shared low-cost key with tight limits.
          </p>
          <p className="mt-1">{BRAND.built}</p>
        </footer>
      </main>
    </div>
  );
}
