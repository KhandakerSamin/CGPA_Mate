"use client";

import { Button, Card, Input, SectionCard } from "./ui";

function round1(value) {
  return Math.round(value * 10) / 10;
}

function getRemark(cgpa) {
  if (cgpa >= 3.8) return { label: "Excellent", emoji: "🏆", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" };
  if (cgpa >= 3.5) return { label: "Very Good", emoji: "🌟", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (cgpa >= 3.0) return { label: "Good", emoji: "✅", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" };
  if (cgpa >= 2.5) return { label: "Satisfactory", emoji: "👍", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/30" };
  if (cgpa >= 2.0) return { label: "Pass", emoji: "📘", color: "text-muted", bg: "bg-surface border-border" };
  if (cgpa > 0)   return { label: "Needs Improvement", emoji: "💪", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" };
  return null;
}

function getBarColor(cgpa) {
  if (cgpa >= 3.8) return "#f59e0b";
  if (cgpa >= 3.5) return "#10b981";
  if (cgpa >= 3.0) return "#3b82f6";
  if (cgpa >= 2.5) return "#38bdf8";
  if (cgpa >= 2.0) return "#94a3b8";
  return "#f43f5e";
}

function CircularGauge({ value }) {
  const clamped = Math.min(4, Math.max(0, value));
  const progress = (clamped / 4) * 100;
  const color = getBarColor(clamped);

  // SVG arc parameters
  const size = 160;
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (progress / 100) * circumference;
  const gap = circumference - dash;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ position: "absolute" }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1), stroke 0.4s" }}
        />
      </svg>

      {/* Center text */}
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight text-fg" style={{ color }}>
          {value.toFixed(2)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted mt-0.5">out of 4.00</span>
      </div>
    </div>
  );
}

function StatPill({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-fg tabular-nums">{value}</span>
        {sub && <span className="ml-1 text-[10px] text-muted">{sub}</span>}
      </div>
    </div>
  );
}

export default function TotalCgpaTab({
  semesters,
  onUpdateSemester,
  onRemoveSemester,
  newSemesterForm,
  onNewSemesterChange,
  onAddManualSemester,
  totalStats,
}) {
  const remark = getRemark(totalStats.cgpa);
  const percentage = ((totalStats.cgpa / 4) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Total CGPA"
        subtitle="Manage your semesters to calculate your overall CGPA."
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: 2/3 - Semesters List and Add Form */}
          <div className="flex-1 lg:w-2/3 space-y-4">
            {semesters.length > 0 && (
              <div className="space-y-3">
                {semesters.map((semester) => (
                  <div
                    key={semester.id}
                    className="flex flex-col sm:flex-row items-end gap-3 rounded-2xl border border-border bg-surface-2/40 p-3 shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="flex-1 w-full min-w-35">
                      <Input
                        label="Semester Name"
                        value={semester.name}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { name: value })
                        }
                        placeholder="e.g. Fall 2024"
                      />
                    </div>
                    <div className="w-full sm:w-32.5 shrink-0">
                      <Input
                        label="CGPA"
                        type="number"
                        min={0}
                        max={4}
                        step={0.01}
                        value={semester.cgpa}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { cgpa: Number(value) })
                        }
                        placeholder="e.g. 3.75"
                      />
                    </div>
                    <div className="flex flex-col w-full sm:w-30 shrink-0 gap-1">
                      <label className="text-sm font-medium text-muted">Credits</label>
                      <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                        <input
                          type="number"
                          className="w-10 bg-transparent text-center text-sm font-semibold text-fg tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={semester.credits === "" ? "" : Number(semester.credits || 0).toFixed(1)}
                          onChange={(e) => onUpdateSemester(semester.id, { credits: e.target.value })}
                        />
                        <div className="h-4 w-px bg-border/60" />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSemester(semester.id, {
                                credits: Math.max(0, round1(Number(semester.credits || 0) - 1)),
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSemester(semester.id, {
                                credits: Math.min(200, round1(Number(semester.credits || 0) + 1)),
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex h-11 w-full sm:w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                      onClick={() => onRemoveSemester(semester.id)}
                      title="Remove Semester"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New row */}
            <div className="mt-4 flex flex-col sm:flex-row items-end gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex-1 w-full min-w-35">
                <Input
                  label="Semester Name"
                  value={newSemesterForm.name}
                  onChange={(value) => onNewSemesterChange("name", value)}
                  placeholder="New Semester"
                />
              </div>
              <div className="w-full sm:w-32.5 shrink-0">
                <Input
                  label="CGPA"
                  type="number"
                  min={0}
                  max={4}
                  step={0.01}
                  value={newSemesterForm.cgpa}
                  onChange={(value) => onNewSemesterChange("cgpa", value)}
                  placeholder="3.50"
                />
              </div>
              <div className="flex flex-col w-full sm:w-30 shrink-0 gap-1">
                <label className="text-sm font-medium text-muted">Credits</label>
                <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                  <input
                    type="number"
                    className="w-10 bg-transparent text-center text-sm font-semibold text-fg tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={newSemesterForm.credits === "" ? "" : Number(newSemesterForm.credits || 0).toFixed(1)}
                    onChange={(e) => onNewSemesterChange("credits", e.target.value)}
                    placeholder="0.0"
                  />
                  <div className="h-4 w-px bg-border/60" />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onNewSemesterChange("credits", Math.max(0, round1(Number(newSemesterForm.credits || 0) - 1)))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onNewSemesterChange("credits", Math.min(200, round1(Number(newSemesterForm.credits || 0) + 1)))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onAddManualSemester}
              className="mt-3 w-full sm:w-auto shadow-md"
            >
              + Add Semester
            </Button>
          </div>

          {/* Right Side: 1/3 - Redesigned Total CGPA Panel */}
          <div className="flex flex-col lg:w-1/3 lg:max-w-[300px] shrink-0 lg:border-l lg:border-border lg:pl-6">
            <div className="rounded-2xl border border-border bg-surface-2/60 overflow-hidden shadow-sm">

              {/* Header strip */}
              <div className="px-5 pt-5 pb-3 text-center border-b border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
                  Cumulative CGPA
                </p>
                <p className="text-xs text-muted/60">
                  {semesters.length > 0
                    ? `Based on ${semesters.length} semester${semesters.length > 1 ? "s" : ""}`
                    : "No semesters added yet"}
                </p>
              </div>

              {/* Gauge */}
              <div className="flex flex-col items-center px-5 py-6 gap-4">
                <CircularGauge value={totalStats.cgpa} />

                {/* Remark badge */}
                {remark ? (
                  <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 ${remark.bg}`}>
                    <span className="text-base leading-none">{remark.emoji}</span>
                    <span className={`text-sm font-bold ${remark.color}`}>{remark.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border border-border px-4 py-1.5 bg-surface">
                    <span className="text-sm text-muted font-medium">No data yet</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="px-4 pb-5 space-y-2">
                <StatPill
                  label="Total Credits"
                  value={totalStats.credits.toFixed(1)}
                  sub="credits"
                />
                <StatPill
                  label="Percentage"
                  value={totalStats.cgpa > 0 ? `${percentage}%` : "—"}
                />
                <StatPill
                  label="Semesters"
                  value={semesters.length || "—"}
                />
              </div>

              {/* Progress bar footer */}
              {totalStats.cgpa > 0 && (
                <div className="px-4 pb-4">
                  <div className="flex justify-between text-[10px] text-muted mb-1.5">
                    <span>0.00</span>
                    <span className="font-semibold" style={{ color: getBarColor(totalStats.cgpa) }}>
                      {totalStats.cgpa.toFixed(2)}
                    </span>
                    <span>4.00</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(totalStats.cgpa / 4) * 100}%`,
                        backgroundColor: getBarColor(totalStats.cgpa),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}