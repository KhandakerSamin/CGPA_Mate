"use client";

import { Button } from "@/components/homepage/ui";

export default function AboutPanel({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-[28px] border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">
              About
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-fg">CGPA Mate</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted">
          <p>
            CGPA Mate helps you estimate subject results, convert them into
            semester CGPA, and track your overall academic progress in one
            connected workspace.
          </p>
          <p>
            The experience is designed for mobile-first clarity, smooth
            transitions, and an elegant card-based layout so you can focus on
            your outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}
