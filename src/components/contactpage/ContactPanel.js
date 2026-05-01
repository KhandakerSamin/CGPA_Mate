"use client";

import { Button, Input } from "@/components/homepage/ui";

export default function ContactPanel({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-[28px] border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">
              Contact
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-fg">
              Share Feedback
            </h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input label="Name" value="" onChange={() => {}} placeholder="" />
          <Input label="Email" value="" onChange={() => {}} placeholder="" />
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          <span className="font-medium text-fg">Message</span>
          <textarea
            className="min-h-[120px] rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-fg shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            placeholder="Tell us what would make CGPA Mate even better."
          />
        </label>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}
