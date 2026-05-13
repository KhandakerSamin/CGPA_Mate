"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "cgpaMate_theme";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function Navbar({ onOpenAbout, onOpenContact }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const nextTheme = stored || (systemPrefersDark ? "dark" : "light");
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <nav className="sticky top-0 z-30 w-full border-b border-border/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-primary/10 px-3 py-2 text-lg font-semibold text-primary">
            4.0
          </span>
          <span className="font-logo text-lg font-semibold text-fg sm:text-xl">
            CGPA Mate
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-fg transition hover:border-primary/50 hover:bg-surface-2 hover:text-primary active:scale-95"
            onClick={onOpenAbout}
          >
            About
          </button>
          <button
            className="hidden sm:inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-fg transition hover:border-primary/50 hover:bg-surface-2 hover:text-primary active:scale-95"
            onClick={onOpenContact}
          >
            Contact
          </button>
          <button
            className="relative flex h-10 w-20 items-center rounded-full border border-border bg-surface px-1 transition hover:border-primary/30 active:scale-95 focus:outline-none"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className="flex w-full justify-between px-1.5 text-xs">
              <span className="opacity-70">☀️</span>
              <span className="opacity-70">🌙</span>
            </div>
            <div
              className={`absolute left-1 top-1 h-8 w-8 rounded-full shadow border border-border flex items-center justify-center transition-all bg-white dark:bg-surface-2 duration-300 ease-in-out ${
                theme === "dark" ? "translate-x-10" : "translate-x-0"
              }`}
            >
              {theme === "dark" ? <span className="text-[14px]">🌙</span> : <span className="text-[14px]">☀️</span>}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
