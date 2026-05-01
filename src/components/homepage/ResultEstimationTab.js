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
  { key: "quiz", label: "Quiz", max: MAX.quiz },
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

  const total =
    clamp(form.assignment, 0, MAX.assignment) +
    clamp(form.presentation, 0, MAX.presentation) +
    attendance +
    clamp(form.quiz, 0, MAX.quiz) +
    clamp(form.mid, 0, MAX.mid) +
    clamp(form.final, 0, MAX.final);

  return {
    attendance,
    total: round1(total),
  };
}

function MarkField({ label, value, max, onChange }) {
  const percent = Math.min(100, (value / max) * 100 || 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-fg">{label}</p>
          <p className="text-xs text-muted">Out of {max}</p>
        </div>
        <input
          className="h-9 w-20 rounded-xl border border-border bg-surface px-2 text-right text-sm text-fg focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          type="number"
          min={0}
          max={max}
          step={0.5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
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
  const nextTarget = nextGradeTarget(totals.total);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Result Estimation"
        subtitle="Enter marks to preview total, grade, and GPA before adding subjects."
        action={
          <Button onClick={onAddSubject} className="w-full sm:w-auto">
            Add Subject
          </Button>
        }
      >
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
              <Input
                label="Attendance %"
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.attendancePercent}
                onChange={(value) => onFormChange("attendancePercent", value)}
              />
            ) : (
              <Input
                label="Attendance Marks"
                type="number"
                min={0}
                max={MAX.attendance}
                step={0.5}
                value={form.attendanceMarks}
                onChange={(value) => onFormChange("attendanceMarks", value)}
              />
            )}
            <div className="text-xs text-muted">
              Recorded attendance: {totals.attendance} / {MAX.attendance}
            </div>
          </Card>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatPill label="Total" value={`${totals.total} / 100`} />
          <StatPill label="Grade" value={grade.grade} tone="success" />
          <StatPill label="GPA" value={grade.gpa.toFixed(2)} tone="warning" />
          {nextTarget ? (
            <StatPill
              label="Next Grade"
              value={`${nextTarget.grade} at ${nextTarget.min}+`}
            />
          ) : null}
        </div>
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
              <Card key={subject.id} className="min-w-[240px] flex-1">
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
