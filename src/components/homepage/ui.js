"use client";

import { useEffect, useState } from "react";

export function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface/90 p-6 shadow-[0_26px_70px_-55px_rgba(15,23,42,0.45)] backdrop-blur">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-fg sm:text-2xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface-2/80 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

  const styles = {
    primary: "bg-primary text-white shadow-sm hover:bg-primary/90",
    ghost: "bg-transparent text-fg hover:bg-surface-2",
    subtle:
      "bg-surface-2 text-fg hover:bg-surface-2/70 border border-border",
    outline:
      "border border-border bg-transparent text-fg hover:border-primary hover:text-primary",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  className = "",
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm ${className}`}>
      <span className="font-medium text-fg">{label}</span>
      <input
        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-fg">{label}</span>
      <select
        className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-fg shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatPill({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-surface-2 text-fg",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  };

  return (
    <div
      className={`rounded-full px-4 py-2 text-xs font-semibold ${tones[tone]}`}
    >
      {label}: <span className="ml-1 text-sm">{value}</span>
    </div>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return () => setToasts([]);
  }, []);

  const addToast = (message, tone = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2400);
  };

  return { toasts, addToast };
}

export function ToastStack({ toasts }) {
  const tones = {
    info: "bg-slate-900 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[calc(100%-3rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-rise rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${tones[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
