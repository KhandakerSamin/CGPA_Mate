"use client";

import { useMemo } from "react";
import { gradeFromScore, nextGradeTarget } from "@/lib/cgpa";
import { Button, Input, SectionCard } from "./ui";

const MAX = {
  assignment: 5,
  presentation: 8,
  attendance: 7,
  quiz: 15,
  mid: 25,
  final: 40,
};

function clamp(value, min, max) {
  const safe = Number(value);
  if (Number.isNaN(safe)) return min;
  return Math.min(max, Math.max(min, safe));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function attendanceFromPercent(percent) {
  return round1((clamp(percent, 0, 100) / 100) * MAX.attendance);
}

// Compute quiz average (Best 3 of 4 or Avg of 3)
function computeQuizAvg(scores, count) {
  const n = clamp(count, 3, 4);
  const vals = scores.slice(0, n).map((s) => clamp(s, 0, MAX.quiz));

  if (n === 4) {
    // Best 3 of 4
    const sorted = [...vals].sort((a, b) => b - a).slice(0, 3);
    return sorted.reduce((t, s) => t + s, 0) / 3;
  }
  // Average of 3
  return vals.length > 0 ? vals.reduce((t, s) => t + s, 0) / vals.length : 0;
}

// Core calculation
function calculateTotals(form) {
  const attendance =
    form.attendanceMode === "percent"
      ? attendanceFromPercent(form.attendancePercent)
      : clamp(form.attendanceMarks, 0, MAX.attendance);

  let quizValue = 0;
  if (form.quizMode === "average") {
    quizValue = clamp(Number(form.quizAverage), 0, MAX.quiz);
  } else if (form.quizMode === "breakdown") {
    quizValue = computeQuizAvg(form.quizScores, form.quizCount);
  }

  const total =
    clamp(Number(form.assignment), 0, MAX.assignment) +
    clamp(Number(form.presentation), 0, MAX.presentation) +
    attendance +
    quizValue +
    clamp(Number(form.mid), 0, MAX.mid) +
    clamp(Number(form.final), 0, MAX.final);

  return {
    attendance: round1(attendance),
    quizValue: round2(quizValue),
    total: round1(total),
  };
}

function MarkField({ label, value, max, onChange }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="text-sm font-semibold text-fg">
          {Number(value || 0).toFixed(1)}{" "}
          <span className="text-[10px] font-normal text-muted">/ {max}</span>
        </span>
      </div>
      <input
        className="w-full accent-primary"
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function ResultEstimationTab({
  form,
  onFormChange,
  onAddSubject,
  subjects,
  onAddToSemester,
  onRemoveSubject,
}) {
  const totals = useMemo(() => calculateTotals(form), [form]);
  const grade = gradeFromScore(totals.total);

  const liveQuizAvg = useMemo(
    () => round2(computeQuizAvg(form.quizScores, form.quizCount)),
    [form.quizScores, form.quizCount]
  );

  const nextGrade = useMemo(() => {
    const next = nextGradeTarget(totals.total);
    if (!next) return null;
    const needed = round1(next.min - totals.total);
    return needed > 0 ? { grade: next.grade, marksNeeded: needed } : null;
  }, [totals.total]);

  const liveAttendanceMark = attendanceFromPercent(form.attendancePercent);

  const hasNegative = [
    form.credit,
    form.attendancePercent,
    form.attendanceMarks,
    form.quizAverage,
    ...form.quizScores,
  ].some((v) => Number(v) < 0);

  // ── Top Summary Pill ──
  const summaryBlock = (
    <div className="rounded-xl hidden md:block border border-border bg-surface-2 px-4 py-2 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">Total Marks</p>
          <p className="mt-0.5 text-lg font-bold leading-none text-fg">{totals.total}</p>
        </div>
        <div className="h-6 w-px bg-border/60" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">Grade</p>
          <p className="mt-0.5 text-lg font-bold leading-none text-primary">
            {grade.grade} ({grade.gpa.toFixed(2)})
          </p>
        </div>
      </div>
      {nextGrade && (
        <p className="mt-1.5 text-center text-xs text-muted">
          Next Grade: <span className="font-semibold text-amber-500">{nextGrade.grade}</span>{" "}
          <span className="text-[10px]">(+{nextGrade.marksNeeded})</span>
        </p>
      )}
    </div>
  );

  // ── Add All to Semester Button ──
  const addAllBlock = subjects.length > 0 && (
    <button
      type="button"
      onClick={() => subjects.forEach((sub) => onAddToSemester(sub.id))}
      className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white active:scale-95 transition"
    >
      + Add All to Semester
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Result Estimation"
        subtitle="Enter marks to preview total and grade before adding."
        action={summaryBlock}
      >
        {/* Subject Name + Credit */}
        <div className="mb-5 flex items-end gap-3">
          <div className="max-w-2/3 flex-1">
            <Input
              label="Subject Name"
              value={form.name}
              onChange={(v) => onFormChange("name", v)}
              placeholder="e.g. Data Structures"
            />
          </div>

          <div className="flex flex-col min-w-1/3 gap-1">
            <label className="text-sm font-medium text-muted">Credit</label>
            <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface-2/70 px-2">
              <span className="w-8 select-none text-center text-sm font-semibold text-fg tabular-nums">
                {Number(form.credit || 0).toFixed(1)}
              </span>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onFormChange("credit", Math.max(0, round1(Number(form.credit || 0) - 0.5)))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary hover:bg-primary hover:text-white active:scale-95 transition"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => onFormChange("credit", Math.min(6, round1(Number(form.credit || 0) + 0.5)))}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-sm font-bold text-primary hover:bg-primary hover:text-white active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Assignment, Presentation, Attendance */}
          <div className="grid gap-3 sm:grid-cols-3">
            <MarkField label="Assignment" max={MAX.assignment} value={form.assignment} onChange={(v) => onFormChange("assignment", v)} />
            <MarkField label="Presentation" max={MAX.presentation} value={form.presentation} onChange={(v) => onFormChange("presentation", v)} />

            {/* Attendance */}
            <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted">Attendance</span>
                <div className="flex items-center gap-2">
                  {form.attendanceMode === "percent" && (
                    <span className="text-xs font-semibold text-fg tabular-nums">
                      {liveAttendanceMark}
                      <span className="ml-0.5 text-[10px] font-normal text-muted">/ {MAX.attendance}</span>
                    </span>
                  )}
                  <div className="flex shrink-0 items-center rounded-md bg-surface p-0.5 text-[10px]">
                    <button
                      className={`rounded px-1.5 py-0.5 transition ${form.attendanceMode === "percent" ? "bg-primary text-white" : "text-muted"}`}
                      onClick={() => onFormChange("attendanceMode", "percent")}
                      type="button"
                    >
                      %
                    </button>
                    <button
                      className={`rounded px-1.5 py-0.5 transition ${form.attendanceMode === "manual" ? "bg-primary text-white" : "text-muted"}`}
                      onClick={() => onFormChange("attendanceMode", "manual")}
                      type="button"
                    >
                      Marks
                    </button>
                  </div>
                </div>
              </div>

              {form.attendanceMode === "percent" ? (
                <div className="flex items-center gap-2">
                  <input
                    className="w-full accent-primary"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={form.attendancePercent}
                    onChange={(e) => onFormChange("attendancePercent", e.target.value)}
                  />
                  <span className="w-9 shrink-0 text-right text-sm font-semibold text-fg tabular-nums">
                    {Number(form.attendancePercent || 0)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    className="w-full accent-primary"
                    type="range"
                    min={0}
                    max={MAX.attendance}
                    step={0.5}
                    value={form.attendanceMarks}
                    onChange={(e) => onFormChange("attendanceMarks", e.target.value)}
                  />
                  <span className="w-9 shrink-0 text-right text-sm font-semibold text-fg tabular-nums">
                    {Number(form.attendanceMarks || 0).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mid + Final */}
          <div className="grid gap-3 sm:grid-cols-2">
            <MarkField label="Midterm" max={MAX.mid} value={form.mid} onChange={(v) => onFormChange("mid", v)} />
            <MarkField label="Final" max={MAX.final} value={form.final} onChange={(v) => onFormChange("final", v)} />
          </div>

          {/* Quiz Section */}
          <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-muted">
                Quiz <span className="text-[10px] text-muted/70">({form.quizCount === 4 ? "Best 3 of 4" : "Average of 3"})</span>
              </span>
              <div className="flex items-center gap-1 rounded-md bg-surface p-0.5 text-[10px]">
                <button
                  className={`rounded px-2.5 py-0.5 transition ${form.quizMode === "average" ? "bg-primary text-white" : "text-muted"}`}
                  onClick={() => {
                    onFormChange("quizMode", "average");
                    onFormChange("quizConfirmed", false);
                  }}
                  type="button"
                >
                  Direct
                </button>
                <button
                  className={`rounded px-2.5 py-0.5 transition ${form.quizMode === "breakdown" ? "bg-primary text-white" : "text-muted"}`}
                  onClick={() => {
                    onFormChange("quizMode", "breakdown");
                    onFormChange("quizConfirmed", false);
                  }}
                  type="button"
                >
                  Breakdown
                </button>
              </div>
            </div>

            {form.quizMode === "average" && (
              <div className="flex items-center gap-2">
                <input
                  className="w-full accent-primary"
                  type="range"
                  min={0}
                  max={MAX.quiz}
                  step={0.5}
                  value={form.quizAverage}
                  onChange={(e) => onFormChange("quizAverage", e.target.value)}
                />
                <span className="w-10 text-right text-sm font-semibold text-fg tabular-nums">
                  {Number(form.quizAverage || 0).toFixed(1)}
                </span>
              </div>
            )}

            {form.quizMode === "breakdown" && (
              <>
                {form.quizConfirmed ? (
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-surface/50 px-4 py-3">
                    <div>
                      <span className="text-[10px] text-muted">Quiz Average</span>
                      <div className="text-lg font-bold text-fg">
                        {round2(computeQuizAvg(form.quizScores, form.quizCount)).toFixed(2)}
                        <span className="text-xs font-normal text-muted ml-1">/ {MAX.quiz}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onFormChange("quizConfirmed", false)}
                      className="rounded-md border border-border bg-surface px-4 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary transition"
                      type="button"
                    >
                      Recalculate
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted">Number of Quizzes:</span>
                      {[3, 4].map((c) => (
                        <button
                          key={c}
                          onClick={() => onFormChange("quizCount", c)}
                          className={`rounded px-3 py-1 text-xs font-semibold transition ${
                            form.quizCount === c
                              ? "bg-primary text-white"
                              : "border border-border bg-surface text-muted hover:bg-surface-2"
                          }`}
                          type="button"
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      {form.quizScores.slice(0, form.quizCount).map((score, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] text-muted">
                            <span>Q{i + 1}</span>
                            <span className="font-semibold text-fg">{Number(score || 0).toFixed(1)}</span>
                          </div>
                          <input
                            className="w-full accent-primary"
                            type="range"
                            min={0}
                            max={MAX.quiz}
                            step={0.5}
                            value={score}
                            onChange={(e) => {
                              const next = [...form.quizScores];
                              next[i] = Number(e.target.value);
                              onFormChange("quizScores", next);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm">
                        Preview:{" "}
                        <span className="font-bold text-fg">{liveQuizAvg.toFixed(2)}</span>
                        <span className="text-xs text-muted"> / {MAX.quiz}</span>
                      </div>
                      <button
                        onClick={() => onFormChange("quizConfirmed", true)}
                        className="rounded-lg bg-primary px-8 py-2 text-sm font-semibold text-white hover:bg-primary/90 active:scale-[0.98] transition"
                        type="button"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Total Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-border/60 bg-surface-2/50 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted">TOTAL</p>
            <p className="text-2xl font-bold text-fg">{totals.total}</p>
          </div>
          <div className="h-8 w-px bg-border/60" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted">GRADE</p>
            <p className="text-2xl font-bold text-primary">
              {grade.grade} ({grade.gpa.toFixed(2)})
            </p>
          </div>
          {nextGrade && (
            <>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted">NEXT</p>
                <p className="text-xl font-bold text-amber-500">{nextGrade.grade}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted">Marks needed</p>
                <p className="text-lg font-semibold text-amber-500">+{nextGrade.marksNeeded}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={onAddSubject} className="w-full sm:w-auto">
            Add Subject to Result
          </Button>
        </div>

        {hasNegative && (
          <p className="mt-3 text-sm font-semibold text-rose-600">
            All marks must be greater than or equal to 0.
          </p>
        )}
      </SectionCard>

      {/* Added Subjects Section */}
      <SectionCard title="Added Subjects" action={addAllBlock}>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-12 bg-surface-2 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-border">
            <div className="col-span-5">Subject Name</div>
            <div className="col-span-2 text-center">Credit</div>
            <div className="col-span-2 text-center">Total Marks</div>
            <div className="col-span-1 text-center">Grade</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted">No subjects added yet.</p>
              <p className="text-xs text-muted/70 mt-1">Add subjects from the estimation form above.</p>
            </div>
          ) : (
            subjects.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-12 items-center px-5 py-4 border-b border-border/50 last:border-0 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="col-span-5 font-medium text-sm truncate pr-2">{sub.name || "Untitled Subject"}</div>
                <div className="col-span-2 text-center text-sm tabular-nums font-medium">{sub.credit}</div>
                <div className="col-span-2 text-center text-sm font-bold tabular-nums">{sub.total}</div>
                <div className="col-span-1 text-center font-black text-lg text-primary">{sub.grade}</div>
                <div className="col-span-2 flex justify-end gap-4">
                  <button
                    onClick={() => onAddToSemester(sub.id)}
                    className="text-xs font-bold text-primary hover:underline transition"
                  >
                    + SEM
                  </button>
                  <button
                    onClick={() => onRemoveSubject(sub.id)}
                    className="text-rose-500 hover:text-rose-600 transition hover:scale-110"
                    title="Remove subject"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}