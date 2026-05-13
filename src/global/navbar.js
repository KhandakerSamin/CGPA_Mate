"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const nextTheme = stored || (systemPrefersDark ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <>
      <nav className="sticky top-0 z-30 w-full border-b border-border/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
              alt="CGPA Mate Logo"
              width={150}
              height={120}
              className="w-full"
              priority
            />
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
              className="hidden sm:flex relative h-10 w-20 items-center rounded-full border border-border bg-surface px-1 transition hover:border-primary/30 active:scale-95 focus:outline-none"
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
            <button
              className="sm:hidden flex items-center justify-center h-10 w-10 rounded-full border border-border bg-surface transition hover:bg-surface-2 active:scale-95"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <div className="bg-fg h-0.5 w-full rounded-full"></div>
                <div className="bg-fg h-0.5 w-full rounded-full"></div>
                <div className="bg-fg h-0.5 w-full rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:hidden">
          <div className="relative w-full max-w-sm rounded-4xl border border-border/60 bg-surface shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-6">
            <button 
              className="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-2 text-muted hover:text-fg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
            
            <div className="flex flex-col items-center gap-3 mb-2 mt-4">
              <Image
                src={theme === "dark" ? "/logo-dark.png" : "/logo.png"}
                alt="CGPA Mate Logo"
                width={56}
                height={56}
                className="rounded-2xl shadow-sm"
              />
              <h2 className="text-xl font-bold font-logo">CGPA Mate</h2>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                className="w-full rounded-2xl border border-border bg-surface-2/50 px-6 py-4 text-base font-semibold text-fg transition active:bg-primary/10 active:text-primary active:border-primary/30"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAbout();
                }}
              >
                About App
              </button>
              <button
                className="w-full rounded-2xl border border-border bg-surface-2/50 px-6 py-4 text-base font-semibold text-fg transition active:bg-primary/10 active:text-primary active:border-primary/30"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenContact();
                }}
              >
                Contact Us
              </button>
            </div>
            
            <div className="w-full mt-2 flex flex-col items-center pt-6 border-t border-border/50 gap-4">
              <span className="text-sm font-medium text-muted">Theme</span>
              <button
                className="relative flex h-14 w-28 items-center rounded-full border border-border bg-surface-2 px-1.5 transition active:scale-95 focus:outline-none"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <div className="flex w-full justify-between px-2 text-base">
                  <span className="opacity-70">☀️</span>
                  <span className="opacity-70">🌙</span>
                </div>
                <div
                  className={`absolute left-1.5 top-1.5 h-11 w-11 rounded-full shadow-md border border-border flex items-center justify-center transition-all bg-white dark:bg-surface duration-300 ease-in-out ${
                    theme === "dark" ? "translate-x-14" : "translate-x-0"
                  }`}
                >
                  {theme === "dark" ? <span className="text-lg">🌙</span> : <span className="text-lg">☀️</span>}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
