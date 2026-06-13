"use client";

import { useEffect, useRef, useState } from "react";
import { PipelineProvider } from "@/lib/pipeline/store";
import { Board } from "./Board";
import { RunPanel, type RunOutcome } from "./RunPanel";

/**
 * The primary interactive surface: the Kanban board with the "Run a lead"
 * console docked beside it. Running a lead drops a card into a column and fires
 * a toast. Self-contained — wraps its own PipelineProvider.
 */
export function PipelineWorkspace() {
  return (
    <PipelineProvider>
      <PipelineWorkspaceInner />
    </PipelineProvider>
  );
}

function PipelineWorkspaceInner() {
  const [droppedId, setDroppedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; hex: string } | null>(null);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dropTimer.current) clearTimeout(dropTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function handleRouted(o: RunOutcome) {
    setDroppedId(o.leadId);
    setToast({ text: o.toast, hex: o.hex });
    if (dropTimer.current) clearTimeout(dropTimer.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    dropTimer.current = setTimeout(() => setDroppedId(null), 1600);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Board first on desktop-left */}
        <div className="order-2 lg:order-1 min-w-0">
          <Board justDroppedId={droppedId} />
        </div>
        {/* Run console docked right */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20">
          <RunPanel onRouted={handleRouted} />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] toast-in">
          <div
            className="bg-ink text-white rounded-card px-4 py-2.5 shadow-float flex items-center gap-2.5 text-[0.82rem]"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: toast.hex }}
            />
            <span className="font-medium">{toast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
