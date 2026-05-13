"use client";

import { useState } from "react";
import { Button, Input } from "@/components/homepage/ui";

export default function ContactPanel({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      setForm({ name: "", email: "", message: "" });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-border/60 bg-surface shadow-2xl">
        <div className="absolute right-4 top-4">
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 p-0 rounded-full hover:bg-surface-2 text-muted hover:text-fg">
            ✕
          </Button>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center sm:text-left">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              Get In Touch
            </span>
            <h2 className="text-3xl font-black tracking-tight text-fg">
              Share Feedback
            </h2>
            <p className="mt-2 text-sm text-muted">
              We&apos;d love to hear your thoughts or feature requests.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Name"
                value={form.name}
                onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
                placeholder="John Doe"
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                placeholder="john@example.com"
              />
            </div>
            
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-fg ml-1">Message</span>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-border/70 bg-surface-2/50 px-4 py-3 text-sm text-fg shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/10"
                placeholder="Tell us what would make CGPA Mate even better..."
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="text-muted hover:text-fg">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} className="min-w-32.5">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
