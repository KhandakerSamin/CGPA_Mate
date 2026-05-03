"use client";

import { Button, Card, Input, SectionCard } from "./ui";

function round1(value) {
  return Math.round(value * 10) / 10;
}

function CircularGauge({ value }) {
  const progress = Math.min(100, (value / 4) * 100);
  return (
    <div className="flex items-center justify-center">
      <div
        className="flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-primary) ${progress}%, var(--color-border) ${progress}% 100%)`,
        }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-xl font-semibold text-fg shadow-inner">
          {value.toFixed(2)}
        </div>
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
                    <div className="flex-1 w-full min-w-[140px]">
                      <Input
                        label="Semester Name"
                        value={semester.name}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { name: value })
                        }
                        placeholder="e.g. Fall 2024"
                      />
                    </div>
                    <div className="w-full sm:w-[130px] shrink-0">
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
                    <div className="flex flex-col w-full sm:w-[120px] shrink-0 gap-1">
                      <label className="text-sm font-medium text-muted">
                        Credits
                      </label>
                      <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                        <span className="w-8 select-none text-center text-sm font-semibold text-fg tabular-nums">
                          {Number(semester.credits || 0).toFixed(1)}
                        </span>
                        <div className="h-4 w-px bg-border/60" />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSemester(semester.id, {
                                credits: Math.max(
                                  0,
                                  round1(Number(semester.credits || 0) - 1)
                                ),
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
                                credits: Math.min(
                                  200,
                                  round1(Number(semester.credits || 0) + 1)
                                ),
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

            {/* Empty state or Add New row */}
            <div className="mt-4 flex flex-col sm:flex-row items-end gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex-1 w-full min-w-[140px]">
                <Input
                  label="Semester Name"
                  value={newSemesterForm.name}
                  onChange={(value) => onNewSemesterChange("name", value)}
                  placeholder="New Semester"
                />
              </div>
              <div className="w-full sm:w-[130px] shrink-0">
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
              <div className="flex flex-col w-full sm:w-[120px] shrink-0 gap-1">
                <label className="text-sm font-medium text-muted">
                  Credits
                </label>
                <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                  <span className="w-8 select-none text-center text-sm font-semibold text-fg tabular-nums">
                    {Number(newSemesterForm.credits || 0).toFixed(1)}
                  </span>
                  <div className="h-4 w-px bg-border/60" />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onNewSemesterChange(
                          "credits",
                          Math.max(
                            0,
                            round1(Number(newSemesterForm.credits || 0) - 1)
                          )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onNewSemesterChange(
                          "credits",
                          Math.min(
                            200,
                            round1(Number(newSemesterForm.credits || 0) + 1)
                          )
                        )
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

          {/* Right Side: 1/3 - Total Cumulative CGPA */}
          <div className="flex flex-col lg:w-1/3 lg:max-w-[320px] shrink-0 gap-6 lg:border-l lg:border-border lg:pl-6">
            <Card className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gradient-to-b from-surface-2 to-surface border-primary/20">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
                Cumulative CGPA
              </p>
              
              <CircularGauge value={totalStats.cgpa} />
              
              <div className="mt-6 flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center bg-surface px-4 py-2 rounded-lg border border-border/50">
                  <span className="text-xs uppercase text-muted font-semibold tracking-wider">Total Credits</span>
                  <span className="text-sm font-bold text-fg">{totalStats.credits.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
