"use client";

import { useEffect, useMemo, useState } from "react";
import { gradeFromScore, nextGradeTarget } from "@/lib/cgpa";

const MAX = {
  assignment: 5,
  presentation: 8,
  attendance: 7,
  quiz: 15,
  mid: 25,
  final: 40,
};

type AttendanceMode = "percent" | "manual";

type Estimation = {
  id: string;
  name: string;
  credit: number;
  assignment: number;
  presentation: number;
  attendanceMode: AttendanceMode;
  attendancePercent: number;
  attendanceMarks: number;
  quiz: number;
  mid: number;
  final: number;
};

type SemesterSubject = {
  id: string;
  name: string;
  credit: number;
  source: "estimation" | "manual";
  estimationId?: string;
  manualGpa?: number;
};

type Semester = {
  id: string;
  name: string;
  subjects: SemesterSubject[];
};

type Toast = {
  id: string;
  message: string;
  tone: "success" | "info" | "warning";
};

const emptyEstimation: Estimation = {
  id: "",
  name: "",
  credit: 3,
  assignment: 0,
  presentation: 0,
  attendanceMode: "percent",
  attendancePercent: 100,
  attendanceMarks: 7,
  quiz: 0,
  mid: 0,
  final: 0,
};

const initialSemester: Semester = {
  id: "semester-1",
  name: "Semester 1",
  subjects: [],
};

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hydrate once from localStorage to avoid mismatched server/client state.
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        setState(JSON.parse(raw) as T);
      } catch {
        setState(initial);
      }
    }
    setHydrated(true);
  }, [key, initial]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state, hydrated]);

  return [state, setState] as const;
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, tone: Toast["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2400);
  };

  return { toasts, addToast };
}

function attendanceFromPercent(percent: number) {
  return round1((clamp(percent, 0, 100) / 100) * MAX.attendance);
}

function getEstimationTotals(estimation: Estimation) {
  // Attendance marks depend on percent vs manual input.
  const attendance =
    estimation.attendanceMode === "percent"
      ? attendanceFromPercent(estimation.attendancePercent)
      : clamp(estimation.attendanceMarks, 0, MAX.attendance);

  const total =
    clamp(estimation.assignment, 0, MAX.assignment) +
    clamp(estimation.presentation, 0, MAX.presentation) +
    attendance +
    clamp(estimation.quiz, 0, MAX.quiz) +
    clamp(estimation.mid, 0, MAX.mid) +
    clamp(estimation.final, 0, MAX.final);

  return {
    attendance,
    total: round1(total),
  };
}

function formatGpa(value: number) {
  return value.toFixed(2);
}

function gpaTone(gpa: number) {
  if (gpa >= 3.5) return "text-emerald-600 dark:text-emerald-400";
  if (gpa >= 2.5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-surface/80 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MarkField({
  label,
  value,
  onChange,
  max,
  step = 0.5,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  step?: number;
  hint?: string;
}) {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-fg">{label}</p>
          {hint ? <p className="text-xs text-muted">{hint}</p> : null}
        </div>
        <div className="text-sm font-semibold text-fg">
          {round1(value)} / {max}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_96px] gap-3">
        <input
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface"
        />
        <input
          type="number"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg"
        />
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CgpaRing({ value, label }: { value: number; label: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(1, Math.max(0, value / 4));
  const offset = circumference - percent * circumference;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2/70 px-5 py-4">
      <svg width="120" height="120" className="text-fg">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-all"
        />
        <text
          x="60"
          y="64"
          textAnchor="middle"
          className="fill-current text-lg font-semibold"
        >
          {value.toFixed(2)}
        </text>
      </svg>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-lg font-semibold text-fg">CGPA Overview</p>
      </div>
    </div>
  );
}

export default function CgpaMateApp() {
  const [theme, setTheme] = usePersistentState<"light" | "dark">(
    "cgpa-mate-theme",
    "light"
  );
  const [estimations, setEstimations] = usePersistentState<Estimation[]>(
    "cgpa-mate-estimations",
    []
  );
  const [semesters, setSemesters] = usePersistentState<Semester[]>(
    "cgpa-mate-semesters",
    [initialSemester]
  );
  const [activeSemesterId, setActiveSemesterId] = usePersistentState(
    "cgpa-mate-active-semester",
    initialSemester.id
  );
  const [draft, setDraft] = useState<Estimation>({ ...emptyEstimation });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetCgpa, setTargetCgpa] = useState(3.5);
  const [targetCredits, setTargetCredits] = useState(15);

  const { toasts, addToast } = useToasts();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const activeSemester = useMemo(() => {
    return (
      semesters.find((semester) => semester.id === activeSemesterId) ??
      semesters[0]
    );
  }, [semesters, activeSemesterId]);

  const draftTotals = useMemo(() => getEstimationTotals(draft), [draft]);
  const draftGrade = useMemo(
    () => gradeFromScore(draftTotals.total),
    [draftTotals.total]
  );

  const draftSuggestion = useMemo(() => {
    const target = nextGradeTarget(draftTotals.total);
    if (!target) return "You already reached the top grade.";
    const required = round1(target.min - draftTotals.total);
    const remainingFinal = MAX.final - draft.final;
    if (required <= 0) return "You already reached the next grade.";
    if (required <= remainingFinal) {
      return `You need ${required} more marks in the final to reach ${target.grade}.`;
    }
    return `Even a perfect final cannot reach ${target.grade}.`;
  }, [draftTotals.total, draft.final]);

  const allSemesterStats = useMemo(() => {
    return semesters.map((semester) => {
      const entries = semester.subjects.map((subject) => {
        if (subject.source === "manual") {
          return {
            credit: subject.credit,
            gpa: subject.manualGpa ?? 0,
          };
        }
        const estimation = estimations.find(
          (item) => item.id === subject.estimationId
        );
        if (!estimation) {
          return { credit: subject.credit, gpa: 0 };
        }
        const total = getEstimationTotals(estimation).total;
        return { credit: subject.credit, gpa: gradeFromScore(total).gpa };
      });

      const totalCredits = entries.reduce(
        (sum, entry) => sum + entry.credit,
        0
      );
      const totalQuality = entries.reduce(
        (sum, entry) => sum + entry.credit * entry.gpa,
        0
      );
      const cgpaRaw = totalCredits > 0 ? totalQuality / totalCredits : 0;

      return {
        id: semester.id,
        name: semester.name,
        credits: totalCredits,
        cgpaRaw,
        cgpa: round1(cgpaRaw),
      };
    });
  }, [semesters, estimations]);

  const overallStats = useMemo(() => {
    const totalCredits = allSemesterStats.reduce(
      (sum, semester) => sum + semester.credits,
      0
    );
    const totalQuality = allSemesterStats.reduce(
      (sum, semester) => sum + semester.credits * semester.cgpaRaw,
      0
    );
    const cgpaRaw = totalCredits > 0 ? totalQuality / totalCredits : 0;
    return {
      credits: totalCredits,
      cgpaRaw,
      cgpa: round1(cgpaRaw),
    };
  }, [allSemesterStats]);

  const targetSuggestion = useMemo(() => {
    if (overallStats.credits === 0) {
      return "Add at least one semester to calculate a target.";
    }
    const neededQuality =
      targetCgpa * (overallStats.credits + targetCredits) -
      overallStats.cgpaRaw * overallStats.credits;
    const required = targetCredits > 0 ? neededQuality / targetCredits : 0;
    const normalized = Math.min(4, Math.max(0, required));
    return `You need about ${formatGpa(normalized)} next semester to reach ${formatGpa(
      targetCgpa
    )}.`;
  }, [overallStats, targetCgpa, targetCredits]);

  const upsertEstimation = (payload: Estimation) => {
    if (!payload.name.trim()) {
      addToast("Add a subject name before saving.", "warning");
      return false;
    }

    if (editingId) {
      setEstimations((current) =>
        current.map((item) => (item.id === editingId ? payload : item))
      );
      setEditingId(null);
      addToast("Subject updated.", "success");
      return true;
    }

    setEstimations((current) => [payload, ...current]);
    addToast("Subject saved.", "success");
    return true;
  };

  const handleSaveDraft = () => {
    const id = editingId ?? `subject-${Date.now()}`;
    const payload = { ...draft, id };
    const saved = upsertEstimation(payload);
    if (!saved) return;
    setDraft({ ...payload });
  };

  const handleAddToSemester = () => {
    const id = editingId ?? `subject-${Date.now()}`;
    const payload = { ...draft, id };
    const saved = upsertEstimation(payload);
    if (!saved) return;

    setSemesters((current) =>
      current.map((semester) => {
        if (semester.id !== activeSemesterId) return semester;
        if (
          semester.subjects.some(
            (subject) => subject.estimationId === id
          )
        ) {
          return semester;
        }
        return {
          ...semester,
          subjects: [
            {
              id: `sem-sub-${Date.now()}`,
              name: payload.name,
              credit: payload.credit,
              source: "estimation",
              estimationId: id,
            },
            ...semester.subjects,
          ],
        };
      })
    );

    addToast("Added to semester.", "success");
  };

  const handleResetDraft = () => {
    setDraft({ ...emptyEstimation });
    setEditingId(null);
  };

  const handleManualSubjectAdd = () => {
    setSemesters((current) =>
      current.map((semester) => {
        if (semester.id !== activeSemesterId) return semester;
        return {
          ...semester,
          subjects: [
            {
              id: `manual-${Date.now()}`,
              name: "Manual Subject",
              credit: 3,
              source: "manual",
              manualGpa: 3.0,
            },
            ...semester.subjects,
          ],
        };
      })
    );
  };

  const handleAddSemester = () => {
    const nextIndex = semesters.length + 1;
    const nextSemester: Semester = {
      id: `semester-${Date.now()}`,
      name: `Semester ${nextIndex}`,
      subjects: [],
    };
    setSemesters((current) => [nextSemester, ...current]);
    setActiveSemesterId(nextSemester.id);
    addToast("New semester created.", "info");
  };

  const handleResetSemester = () => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === activeSemesterId
          ? { ...semester, subjects: [] }
          : semester
      )
    );
  };

  const handleResetAll = () => {
    setEstimations([]);
    setSemesters([initialSemester]);
    setActiveSemesterId(initialSemester.id);
    handleResetDraft();
  };

  const activeSemesterStats = allSemesterStats.find(
    (semester) => semester.id === activeSemesterId
  );

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(46,125,114,0.18),_transparent_60%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-16 pt-10 lg:px-10">
          <header className="flex flex-col gap-6 rounded-[32px] border border-border bg-surface/90 p-6 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.7)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  CGPA Mate
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                  Plan your CGPA with confidence.
                </h1>
              </div>
              <button
                onClick={() =>
                  setTheme((current) =>
                    current === "dark" ? "light" : "dark"
                  )
                }
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-sm transition hover:-translate-y-0.5"
              >
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <a href="#estimator" className="rounded-full bg-surface-2 px-3 py-1">
                Estimator
              </a>
              <a href="#semester" className="rounded-full bg-surface-2 px-3 py-1">
                Semester CGPA
              </a>
              <a href="#total" className="rounded-full bg-surface-2 px-3 py-1">
                Total CGPA
              </a>
              <span className="ml-auto rounded-full bg-surface-2 px-3 py-1">
                Live and connected
              </span>
            </div>
          </header>

          <SectionCard
            title="Subject Result Estimator"
            subtitle="Estimate your subject result and push it directly into your semester plan."
          >
            <div id="estimator" className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
                    <p className="text-sm font-medium text-fg">Subject name</p>
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Data Structures"
                      className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
                    <p className="text-sm font-medium text-fg">Credit</p>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.5}
                      value={draft.credit}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          credit: Number(event.target.value),
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <MarkField
                    label="Assignment"
                    max={MAX.assignment}
                    value={draft.assignment}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, assignment: value }))
                    }
                  />
                  <MarkField
                    label="Presentation"
                    max={MAX.presentation}
                    value={draft.presentation}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        presentation: value,
                      }))
                    }
                  />
                  <div className="rounded-2xl border border-border/60 bg-surface-2/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-fg">Attendance</p>
                        <p className="text-xs text-muted">
                          {draft.attendanceMode === "percent"
                            ? "Percent converts to 7 marks"
                            : "Manual out of 7"}
                        </p>
                      </div>
                      <div className="flex gap-2 rounded-full bg-surface px-1">
                        <button
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              attendanceMode: "percent",
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            draft.attendanceMode === "percent"
                              ? "bg-accent text-white"
                              : "text-muted"
                          }`}
                        >
                          Percent
                        </button>
                        <button
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              attendanceMode: "manual",
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            draft.attendanceMode === "manual"
                              ? "bg-accent text-white"
                              : "text-muted"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-[1fr_96px] gap-3">
                      <input
                        type="range"
                        min={0}
                        max={draft.attendanceMode === "percent" ? 100 : 7}
                        step={1}
                        value={
                          draft.attendanceMode === "percent"
                            ? draft.attendancePercent
                            : draft.attendanceMarks
                        }
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setDraft((current) =>
                            current.attendanceMode === "percent"
                              ? { ...current, attendancePercent: value }
                              : { ...current, attendanceMarks: value }
                          );
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface"
                      />
                      <input
                        type="number"
                        min={0}
                        max={draft.attendanceMode === "percent" ? 100 : 7}
                        step={1}
                        value={
                          draft.attendanceMode === "percent"
                            ? draft.attendancePercent
                            : draft.attendanceMarks
                        }
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setDraft((current) =>
                            current.attendanceMode === "percent"
                              ? { ...current, attendancePercent: value }
                              : { ...current, attendanceMarks: value }
                          );
                        }}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      <span>Marks: {draftTotals.attendance} / 7</span>
                      <span>
                        {draft.attendanceMode === "percent"
                          ? `${draft.attendancePercent}%`
                          : "Manual"}
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{
                          width: `${(draftTotals.attendance / MAX.attendance) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <MarkField
                    label="Quiz average"
                    hint="Optional, out of 15"
                    max={MAX.quiz}
                    value={draft.quiz}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, quiz: value }))
                    }
                  />
                  <MarkField
                    label="Mid exam"
                    max={MAX.mid}
                    value={draft.mid}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, mid: value }))
                    }
                  />
                  <MarkField
                    label="Final exam"
                    max={MAX.final}
                    value={draft.final}
                    onChange={(value) =>
                      setDraft((current) => ({ ...current, final: value }))
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    {editingId ? "Update subject" : "Save subject"}
                  </button>
                  <button
                    onClick={handleAddToSemester}
                    className="rounded-full border border-border bg-surface px-5 py-2 text-sm font-semibold text-fg transition hover:-translate-y-0.5"
                  >
                    Add to semester
                  </button>
                  <button
                    onClick={handleResetDraft}
                    className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted"
                  >
                    Reset estimator
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">
                    Result
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted">Total marks</p>
                      <p className="text-3xl font-semibold text-fg">
                        {draftTotals.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Grade</p>
                      <p className="text-2xl font-semibold text-fg">
                        {draftGrade.grade}
                      </p>
                      <p className={`text-sm font-semibold ${gpaTone(draftGrade.gpa)}`}>
                        GPA {formatGpa(draftGrade.gpa)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        draftTotals.total >= 40
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                      }`}
                    >
                      {draftTotals.total >= 40 ? "Pass" : "Fail"}
                    </span>
                    <span className="text-muted">{draftSuggestion}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <p className="text-sm font-medium text-fg">Saved subjects</p>
                  <div className="mt-4 flex flex-col gap-3">
                    {estimations.length === 0 ? (
                      <p className="text-sm text-muted">
                        No saved subjects yet.
                      </p>
                    ) : (
                      estimations.map((item) => {
                        const total = getEstimationTotals(item).total;
                        const grade = gradeFromScore(total);
                        return (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-fg">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted">
                                {total} marks, {grade.grade} ({formatGpa(grade.gpa)})
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDraft({ ...item });
                                  setEditingId(item.id);
                                }}
                                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setEstimations((current) =>
                                    current.filter((entry) => entry.id !== item.id)
                                  )
                                }
                                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-rose-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Semester CGPA Calculator"
            subtitle="All saved subjects can flow directly into your semester CGPA."
          >
            <div id="semester" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={activeSemesterId}
                    onChange={(event) => setActiveSemesterId(event.target.value)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm"
                  >
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddSemester}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold"
                  >
                    New semester
                  </button>
                  <button
                    onClick={handleManualSubjectAdd}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    Add manual subject
                  </button>
                  <button
                    onClick={handleResetSemester}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted"
                  >
                    Clear semester
                  </button>
                </div>

                <div className="rounded-2xl border border-border bg-surface-2/70 p-4">
                  <label className="text-sm font-medium text-fg">Semester name</label>
                  <input
                    value={activeSemester?.name ?? ""}
                    onChange={(event) =>
                      setSemesters((current) =>
                        current.map((semester) =>
                          semester.id === activeSemesterId
                            ? { ...semester, name: event.target.value }
                            : semester
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {activeSemester?.subjects.length ? (
                    activeSemester.subjects.map((subject) => {
                      const estimation = estimations.find(
                        (item) => item.id === subject.estimationId
                      );
                      const subjectName =
                        subject.source === "manual"
                          ? subject.name
                          : estimation?.name ?? subject.name;
                      const subjectGpa =
                        subject.source === "manual"
                          ? subject.manualGpa ?? 0
                          : estimation
                          ? gradeFromScore(getEstimationTotals(estimation).total).gpa
                          : 0;

                      return (
                        <div
                          key={subject.id}
                          className="rounded-2xl border border-border bg-surface p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-fg">
                                {subjectName}
                              </p>
                              <p className="text-xs text-muted">
                                {subject.source === "manual"
                                  ? "Manual entry"
                                  : "Linked to estimator"}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setSemesters((current) =>
                                  current.map((semester) =>
                                    semester.id === activeSemesterId
                                      ? {
                                          ...semester,
                                          subjects: semester.subjects.filter(
                                            (item) => item.id !== subject.id
                                          ),
                                        }
                                      : semester
                                  )
                                )
                              }
                              className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-rose-600"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-muted">Credit</label>
                              <input
                                type="number"
                                min={1}
                                max={5}
                                step={0.5}
                                value={subject.credit}
                                onChange={(event) => {
                                  const value = Number(event.target.value);
                                  setSemesters((current) =>
                                    current.map((semester) =>
                                      semester.id === activeSemesterId
                                        ? {
                                            ...semester,
                                            subjects: semester.subjects.map((item) =>
                                              item.id === subject.id
                                                ? { ...item, credit: value }
                                                : item
                                            ),
                                          }
                                        : semester
                                    )
                                  );
                                }}
                                className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted">GPA</label>
                              {subject.source === "manual" ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={4}
                                  step={0.01}
                                  value={subject.manualGpa ?? 0}
                                  onChange={(event) => {
                                    const value = Number(event.target.value);
                                    setSemesters((current) =>
                                      current.map((semester) =>
                                        semester.id === activeSemesterId
                                          ? {
                                              ...semester,
                                              subjects: semester.subjects.map((item) =>
                                                item.id === subject.id
                                                  ? {
                                                      ...item,
                                                      manualGpa: value,
                                                    }
                                                  : item
                                              ),
                                            }
                                          : semester
                                      )
                                    );
                                  }}
                                  className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                                />
                              ) : (
                                <p className={`mt-2 text-sm font-semibold ${gpaTone(subjectGpa)}`}>
                                  {formatGpa(subjectGpa)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
                      No subjects yet. Add from the estimator or create a manual subject.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">
                    Semester summary
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted">Credits</p>
                      <p className="text-3xl font-semibold text-fg">
                        {activeSemesterStats?.credits ?? 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Semester CGPA</p>
                      <p className={`text-2xl font-semibold ${gpaTone(activeSemesterStats?.cgpa ?? 0)}`}>
                        {formatGpa(activeSemesterStats?.cgpa ?? 0)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted">
                    This semester is automatically included in total CGPA.
                  </p>
                </div>
                <CgpaRing
                  value={activeSemesterStats?.cgpa ?? 0}
                  label={activeSemester?.name ?? "Semester"}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Total CGPA"
            subtitle="Track every semester and project your overall CGPA."
          >
            <div id="total" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-4">
                <div className="grid gap-3">
                  {allSemesterStats.map((semester) => (
                    <button
                      key={semester.id}
                      onClick={() => setActiveSemesterId(semester.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        semester.id === activeSemesterId
                          ? "border-accent bg-surface"
                          : "border-border bg-surface-2/70"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-fg">
                          {semester.name}
                        </p>
                        <p className="text-xs text-muted">
                          {semester.credits} credits
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ${gpaTone(semester.cgpa)}`}>
                        {formatGpa(semester.cgpa)}
                      </p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleResetAll}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted"
                >
                  Reset all data
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted">
                    Overall
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted">Credits</p>
                      <p className="text-3xl font-semibold text-fg">
                        {overallStats.credits}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Total CGPA</p>
                      <p className={`text-2xl font-semibold ${gpaTone(overallStats.cgpa)}`}>
                        {formatGpa(overallStats.cgpa)}
                      </p>
                    </div>
                  </div>
                </div>
                <CgpaRing value={overallStats.cgpa} label="Overall" />

                <div className="rounded-2xl border border-border bg-surface-2/70 p-5">
                  <p className="text-sm font-semibold text-fg">Target CGPA</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted">Desired CGPA</label>
                      <input
                        type="number"
                        min={0}
                        max={4}
                        step={0.01}
                        value={targetCgpa}
                        onChange={(event) =>
                          setTargetCgpa(Number(event.target.value))
                        }
                        className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted">Next semester credits</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        step={1}
                        value={targetCredits}
                        onChange={(event) =>
                          setTargetCredits(Number(event.target.value))
                        }
                        className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{targetSuggestion}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {toasts.length ? (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
                toast.tone === "success"
                  ? "bg-emerald-500 text-white"
                  : toast.tone === "warning"
                  ? "bg-amber-500 text-white"
                  : "bg-surface text-fg"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
