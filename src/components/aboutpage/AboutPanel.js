"use client";

import { Button } from "@/components/homepage/ui";

export default function AboutPanel({ open, onClose }) {
  if (!open) return null;

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
              About The App
            </span>
            <h2 className="text-3xl font-black tracking-tight text-fg">
              CGPA <span className="text-primary">Mate</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-surface-2/30 p-5">
              <h3 className="mb-2 font-semibold text-fg flex items-center gap-2">
                <span className="text-xl">🎯</span> Purpose
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                CGPA Mate helps you estimate subject results, convert them into semester CGPA, and track your overall academic progress in one seamlessly connected workspace.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border/50 bg-surface-2/30 p-5">
              <h3 className="mb-2 font-semibold text-fg flex items-center gap-2">
                <span className="text-xl">✨</span> Design Focus
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                The experience is designed for mobile-first clarity, smooth transitions, and an elegant card-based layout so you can focus entirely on mapping out your outcomes.
              </p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center sm:justify-start">
            <Button variant="primary" onClick={onClose} className="min-w-30">
              Awesome
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
