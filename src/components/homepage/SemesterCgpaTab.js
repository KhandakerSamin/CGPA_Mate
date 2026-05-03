"use client";

import { useMemo } from "react";
import { Button, Card, Input, SectionCard, Select } from "./ui";
import { gradeScale } from "@/lib/cgpa";

function round1(value) {
  return Math.round(value * 10) / 10;
}

function getRemark(cgpa) {
  if (cgpa >= 3.8) return "Excellent";
  if (cgpa >= 3.5) return "Very Good";
  if (cgpa >= 3.0) return "Good";
  if (cgpa >= 2.5) return "Satisfactory";
  if (cgpa >= 2.0) return "Pass";
  if (cgpa > 0) return "Needs Improvement";
  return "No Data";
}

export default function SemesterCgpaTab({
  subjects,
  manualForm,
  onManualFormChange,
  onAddManualSubject,
  onUpdateSubject,
  onRemoveSubject,
  semesterName,
  onSemesterNameChange,
  onAddSemester,
  semesterStats,
}) {
  const gradeOptions = useMemo(() => {
    return [...gradeScale]
      .sort((a, b) => b.gpa - a.gpa)
      .map((g) => ({
        label: `${g.grade} (${g.gpa.toFixed(2)})`,
        value: g.gpa.toString(),
      }));
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Semester CGPA"
        subtitle="Manage your current semester subjects and grades."
        action={
          <Button onClick={onAddSemester} className="w-full sm:w-auto">
            Add to Total CGPA
          </Button>
        }
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side: 2/3 - Subjects List and Add Form */}
          <div className="flex-1 lg:w-2/3 space-y-4">
            {subjects.length > 0 && (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex flex-col sm:flex-row items-end gap-3 rounded-2xl border border-border bg-surface-2/40 p-3 shadow-sm transition-colors hover:border-primary/30"
                  >
                    <div className="flex-1 w-full min-w-35">
                      <Input
                        label="Subject Name"
                        value={subject.name}
                        onChange={(value) =>
                          onUpdateSubject(subject.id, { name: value })
                        }
                        placeholder="e.g. Data Structures"
                      />
                    </div>
                    <div className="w-full sm:w-32.5 shrink-0">
                      <Select
                        label="Result"
                        value={subject.gpa.toString()}
                        onChange={(value) =>
                          onUpdateSubject(subject.id, { gpa: Number(value) })
                        }
                        options={gradeOptions}
                      />
                    </div>
                    <div className="flex flex-col w-full sm:w-30 shrink-0 gap-1">
                      <label className="text-sm font-medium text-muted">
                        Credit
                      </label>
                      <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                        <input
                          type="number"
                          className="w-10 bg-transparent text-center text-sm font-semibold text-fg tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={subject.credit === "" ? "" : Number(subject.credit || 0).toFixed(1)}
                          onChange={(e) => onUpdateSubject(subject.id, { credit: e.target.value })}
                        />
                        <div className="h-4 w-px bg-border/60" />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSubject(subject.id, {
                                credit: Math.max(
                                  0,
                                  round1(Number(subject.credit || 0) - 0.5)
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
                              onUpdateSubject(subject.id, {
                                credit: Math.min(
                                  6,
                                  round1(Number(subject.credit || 0) + 0.5)
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
                      onClick={() => onRemoveSubject(subject.id)}
                      title="Remove Subject"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state or Add New row */}
            <div className="mt-4 flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
              <div className="flex-1 w-full min-w-35">
                <Input
                  label="Subject Name"
                  value={manualForm.name}
                  onChange={(value) => onManualFormChange("name", value)}
                  placeholder="New Subject"
                />
              </div>
              <div className="w-full sm:w-32.5 shrink-0">
                <Select
                  label="Result"
                  value={manualForm.gpa.toString()}
                  onChange={(value) => onManualFormChange("gpa", value)}
                  options={gradeOptions}
                />
                <div className="mt-2 flex w-full justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onManualFormChange("gpa", "4")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => onManualFormChange("gpa", "3.75")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => onManualFormChange("gpa", "3.5")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    A-
                  </button>
                </div>
              </div>
              <div className="flex flex-col w-full sm:w-30 shrink-0 gap-1">
                <label className="text-sm font-medium text-muted">Credit</label>
                <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-2 shadow-sm">
                  <input
                    type="number"
                    className="w-10 bg-transparent text-center text-sm font-semibold text-fg tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={manualForm.credit === "" ? "" : Number(manualForm.credit || 0).toFixed(1)}
                    onChange={(e) => onManualFormChange("credit", e.target.value)}
                    placeholder="0.0"
                  />
                  <div className="h-4 w-px bg-border/60" />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onManualFormChange(
                          "credit",
                          Math.max(
                            0,
                            round1(Number(manualForm.credit || 0) - 0.5)
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
                        onManualFormChange(
                          "credit",
                          Math.min(
                            6,
                            round1(Number(manualForm.credit || 0) + 0.5)
                          )
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary hover:text-white active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex w-full justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onManualFormChange("credit", "1")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    1.0
                  </button>
                  <button
                    type="button"
                    onClick={() => onManualFormChange("credit", "1.5")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    1.5
                  </button>
                  <button
                    type="button"
                    onClick={() => onManualFormChange("credit", "3")}
                    className="flex-1 rounded border border-border bg-surface px-1 py-1 text-[10px] font-semibold text-muted transition hover:border-primary hover:text-primary"
                  >
                    3.0
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onAddManualSubject}
              className="mt-3 w-full sm:w-auto shadow-md"
            >
              + Add Subject
            </Button>
          </div>

          {/* Right Side: 1/3 - Total Semester CGPA */}
          <div className="flex flex-col lg:w-1/3 lg:max-w-[320px] shrink-0 gap-6 lg:border-l lg:border-border lg:pl-6">
            <Card className="flex flex-col items-center justify-center py-10 px-4 text-center bg-linear-to-b from-surface-2 to-surface border-primary/20">
              <p className="text-sm font-bold uppercase tracking-widest text-muted">
                Total SGPA
              </p>
              <div className="mt-3 flex items-baseline justify-center gap-1 text-primary">
                <span className="text-6xl font-black drop-shadow-sm">
                  {semesterStats.cgpa.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-muted-foreground/60">
                  / 4.00
                </span>
              </div>
              {semesterStats.cgpa > 0 && (
                <p className="mt-2 text-sm font-semibold tracking-wide text-primary">
                  {getRemark(semesterStats.cgpa)}
                </p>
              )}
              <p className="mt-4 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted shadow-inner ring-1 ring-inset ring-border/50">
                Based on {semesterStats.credits.toFixed(1)} Credits
              </p>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-fg">
                  Semester Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-fg shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    value={semesterName}
                    onChange={(e) => onSemesterNameChange(e.target.value)}
                    placeholder="e.g. Fall 2024"
                  />
                </div>
                <p className="text-xs text-muted">
                  Name this semester before adding it to your total CGPA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
