"use client";

import { useMemo } from "react";
import { gradeFromScore, nextGradeTarget } from "@/lib/cgpa";
import { Button, Card, Input, SectionCard, StatPill } from "./ui";

const MAX = {
  assignment: 5,
  presentation: 8,
  attendance: 7,
  quiz: 15,
  mid: 25,
  final: 40,
};

const markFields = [
  { key: "assignment", label: "Assignment", max: MAX.assignment },
  { key: "presentation", label: "Presentation", max: MAX.presentation },
  { key: "mid", label: "Midterm", max: MAX.mid },
  { key: "final", label: "Final", max: MAX.final },
];

function clamp(value, min, max) {
  const safe = Number(value);
  if (Number.isNaN(safe)) return min;
  return Math.min(max, Math.max(min, safe));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function attendanceFromPercent(percent) {
  return round1((clamp(percent, 0, 100) / 100) * MAX.attendance);
}

function calculateTotals(form) {
  const attendance =
    form.attendanceMode === "percent"
      ? attendanceFromPercent(form.attendancePercent)
      : clamp(form.attendanceMarks, 0, MAX.attendance);

  const quizAverage =
    form.quizMode === "average"
      ? clamp(form.quizAverage, 0, MAX.quiz)
      : (() => {
          const count = clamp(form.quizCount, 3, 4);
          const scores = form.quizScores
            .slice(0, count)
            .map((score) => clamp(score, 0, MAX.quiz));
          if (!form.quizConfirmed) return 0;
          if (scores.length === 4) {
            const sorted = [...scores].sort((a, b) => b - a).slice(0, 3);
            const sum = sorted.reduce((total, score) => total + score, 0);
            return sum / 3;
          }
          const sum = scores.reduce((total, score) => total + score, 0);
          return count > 0 ? sum / count : 0;
        })();

  const total =
    clamp(form.assignment, 0, MAX.assignment) +
    clamp(form.presentation, 0, MAX.presentation) +
    attendance +
    quizAverage +
    clamp(form.mid, 0, MAX.mid) +
    clamp(form.final, 0, MAX.final);

  return {
    attendance,
    quizAverage: round1(quizAverage),
    total: round1(total),
  };
}

function MarkField({ label, value, max, onChange }) {
  const percent = Math.min(100, (Number(value) / max) * 100 || 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-fg">{label}</p>
          <p className="text-xs text-muted">Out of {max}</p>
        </div>
      </div>
      <input
        className="mt-3 w-full accent-primary"
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function computeQuizAverage(scores, count) {
  const selected = scores
    .slice(0, count)
    .map((score) => clamp(score, 0, MAX.quiz));
  if (selected.length === 4) {
    const sorted = [...selected].sort((a, b) => b - a).slice(0, 3);
    const sum = sorted.reduce((total, score) => total + score, 0);
    return sum / 3;
  }
  const sum = selected.reduce((total, score) => total + score, 0);
  return count > 0 ? sum / count : 0;
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
  const nextTarget = nextGradeTarget(totals.total);
  const hasNegative = [
    form.credit,
    form.attendancePercent,
    form.attendanceMarks,
    form.quizAverage,
    ...form.quizScores,
  ].some((value) => Number(value) < 0);

  return (
    <div className="space-y-6">
      <SectionCard title="Result Estimation" subtitle="Enter marks to preview total, grade, and GPA before adding subjects.">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <Button onClick={onAddSubject} className="w-full md:w-auto">
            Add Subject
          </Button>
          <div className="sticky top-28 z-10 rounded-2xl border border-border bg-slate-900/95 px-4 py-3 text-white shadow-lg backdrop-blur md:static md:w-[260px] md:bg-surface md:text-fg md:shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70 md:text-muted">
              Current Result
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-white md:text-fg">
                  {totals.total}
                </p>
                <p className="text-[11px] text-white/60 md:text-muted">
                  Total Marks
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-white md:text-fg">
                  {grade.grade}
                </p>
                <p className="text-[11px] text-white/60 md:text-muted">Grade</p>
              </div>
            </div>
            {nextTarget ? (
              <p className="mt-2 text-[11px] text-white/60 md:text-muted">
                Next {nextTarget.grade} at {nextTarget.min}+
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Subject Name"
            value={form.name}
            onChange={(value) => onFormChange("name", value)}
            placeholder="e.g. Data Structures"
          />
          <Input
            label="Credit"
            type="number"
            min={1}
            max={6}
            step={0.5}
            value={form.credit}
            onChange={(value) => onFormChange("credit", value)}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {markFields.map((field) => (
            <MarkField
              key={field.key}
              label={field.label}
              max={field.max}
              value={form[field.key]}
              onChange={(value) => onFormChange(field.key, value)}
            />
          ))}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-fg">Attendance</p>
              <div className="flex items-center gap-2 rounded-full bg-surface px-2 py-1 text-xs text-muted">
                <button
                  className={`rounded-full px-2 py-1 transition ${
                    form.attendanceMode === "percent"
                      ? "bg-primary text-white"
                      : "text-muted"
                  }`}
                  onClick={() => onFormChange("attendanceMode", "percent")}
                  type="button"
                >
                  %
                </button>
                <button
                  className={`rounded-full px-2 py-1 transition ${
                    form.attendanceMode === "manual"
                      ? "bg-primary text-white"
                      : "text-muted"
                  }`}
                  onClick={() => onFormChange("attendanceMode", "manual")}
                  type="button"
                >
                  Marks
                </button>
              </div>
            </div>
            {form.attendanceMode === "percent" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Attendance %</span>
                  <span className="text-sm font-semibold text-fg">
                    {Number(form.attendancePercent || 0).toFixed(0)}%
                  </span>
                </div>
                <input
                  className="w-full accent-primary"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={form.attendancePercent}
                  onChange={(event) =>
                    onFormChange("attendancePercent", event.target.value)
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Attendance Marks</span>
                  <span className="text-sm font-semibold text-fg">
                    {Number(form.attendanceMarks || 0).toFixed(1)}
                  </span>
                </div>
                <input
                  className="w-full accent-primary"
                  type="range"
                  min={0}
                  max={MAX.attendance}
                  step={0.5}
                  value={form.attendanceMarks}
                  onChange={(event) =>
                    onFormChange("attendanceMarks", event.target.value)
                  }
                />
              </div>
            )}
            <div className="text-xs text-muted">
              Recorded attendance: {totals.attendance} / {MAX.attendance}
            </div>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-fg">Quiz Average</p>
              <div className="flex items-center gap-2 rounded-full bg-surface px-2 py-1 text-xs text-muted">
                <button
                  className={`rounded-full px-2 py-1 transition ${
                    form.quizMode === "average"
                      ? "bg-primary text-white"
                      : "text-muted"
                  }`}
                  onClick={() => onFormChange("quizMode", "average")}
                  type="button"
                >
                  Direct
                </button>
                <button
                  className={`rounded-full px-2 py-1 transition ${
                    form.quizMode === "breakdown"
                      ? "bg-primary text-white"
                      : "text-muted"
                  }`}
                  onClick={() => onFormChange("quizMode", "breakdown")}
                  type="button"
                >
                  Quiz 1-3/4
                </button>
              </div>
            </div>
            {form.quizMode === "average" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Quiz Average</span>
                  <span className="text-sm font-semibold text-fg">
                    {Number(form.quizAverage || 0).toFixed(1)}
                  </span>
                </div>
                <input
                  className="w-full accent-primary"
                  type="range"
                  min={0}
                  max={MAX.quiz}
                  step={0.5}
                  value={form.quizAverage}
                  onChange={(event) =>
                    onFormChange("quizAverage", event.target.value)
                  }
                />
              </div>
            ) : form.quizConfirmed ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Confirmed Average</span>
                  <span className="text-sm font-semibold text-fg">
                    {Number(form.quizAverage || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                  type="button"
                  onClick={() => onFormChange("quizConfirmed", false)}
                >
                  Recalculate
                </button>
                <p className="text-xs text-muted">
                  {form.quizCount === 4
                    ? "Average counts the best 3 quizzes."
                    : "Average is calculated from the provided quizzes."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center justify-between text-xs text-muted">
                  <span>Quiz Count</span>
                  <div className="flex gap-2">
                    {[3, 4].map((count) => (
                      <button
                        key={count}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          form.quizCount === count
                            ? "bg-primary text-white"
                            : "border border-border text-muted"
                        }`}
                        onClick={() => onFormChange("quizCount", count)}
                        type="button"
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {form.quizScores
                    .slice(0, form.quizCount)
                    .map((score, index) => (
                      <div
                        key={`quiz-${index + 1}`}
                        className="rounded-2xl border border-border/60 bg-surface-2/70 p-3"
                      >
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{`Quiz ${index + 1}`}</span>
                          <span className="text-sm font-semibold text-fg">
                            {Number(score || 0).toFixed(1)}
                          </span>
                        </div>
                        <input
                          className="mt-3 w-full accent-primary"
                          type="range"
                          min={0}
                          max={MAX.quiz}
                          step={0.5}
                          value={score}
                          onChange={(event) => {
                            const nextScores = [...form.quizScores];
                            nextScores[index] = Number(event.target.value);
                            onFormChange("quizScores", nextScores);
                          }}
                        />
                      </div>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                    type="button"
                    onClick={() => {
                      const average = computeQuizAverage(
                        form.quizScores,
                        form.quizCount
                      );
                      onFormChange("quizAverage", Number(average.toFixed(2)));
                      onFormChange("quizConfirmed", true);
                    }}
                  >
                    OK
                  </button>
                </div>
                <p className="text-xs text-muted">
                  {form.quizCount === 4
                    ? "Average will count the best 3 quizzes."
                    : "Average is calculated from the provided quizzes."}
                </p>
              </div>
            )}
            <div className="text-xs text-muted">
              {form.quizMode === "breakdown" && !form.quizConfirmed
                ? "Press OK to confirm quiz average."
                : `Current quiz average: ${totals.quizAverage} / ${MAX.quiz}`}
            </div>
          </Card>
        </div>
        {hasNegative ? (
          <p className="mt-4 text-sm font-semibold text-rose-600">
            Please enter values greater than or equal to 0.
          </p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Subjects"
        subtitle="Subjects stay in a single row on mobile. Add them to the semester when ready."
      >
        {subjects.length === 0 ? (
          <p className="text-sm text-muted">
            No subjects added yet. Your saved subjects will appear here.
          </p>
        ) : (
          <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-2">
            {subjects.map((subject) => (
              <Card key={subject.id} className="min-w-60 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-fg">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-muted">
                      Credit {subject.credit}
                    </p>
                  </div>
                  <button
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                    onClick={() => onRemoveSubject(subject.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted">Total</p>
                    <p className="text-lg font-semibold text-fg">
                      {subject.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Grade</p>
                    <p className="text-lg font-semibold text-fg">
                      {subject.grade}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">GPA</p>
                    <p className="text-lg font-semibold text-fg">
                      {subject.gpa.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => onAddToSemester(subject.id)}
                >
                  Add to Semester
                </Button>
              </Card>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
