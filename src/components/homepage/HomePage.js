"use client";

import { useMemo, useState } from "react";
import Navbar from "@/global/navbar";
import Footer from "@/global/footer";
import AboutPanel from "@/components/aboutpage/AboutPanel";
import ContactPanel from "@/components/contactpage/ContactPanel";
import ResultEstimationTab from "./ResultEstimationTab";
import SemesterCgpaTab from "./SemesterCgpaTab";
import TotalCgpaTab from "./TotalCgpaTab";
import { calculateWeightedGpa, gradeFromScore } from "@/lib/cgpa";
import {  ToastStack, useToasts } from "./ui";
import { useLocalStorage } from "./useLocalStorage";

const TABS = [
  { id: "estimation", label: "Result Estimation" },
  { id: "semester", label: "Semester CGPA" },
  { id: "total", label: "Total CGPA" },
];

const initialEstimationForm = {
  name: "",
  credit: 3,
  assignment: 0,
  presentation: 0,
  attendanceMode: "percent",
  attendancePercent: 100,
  attendanceMarks: 7,
  quizMode: "average",
  quizAverage: 0,
  quizScores: [0, 0, 0, 0],
  quizCount: 3,
  quizConfirmed: false,
  mid: 0,
  final: 0,
};

const initialManualSubject = {
  name: "",
  credit: "",
  gpa: "",
};

const initialManualSemester = {
  name: "",
  cgpa: "",
  credits: "",
};

const MAX_MARKS = {
  assignment: 5,
  presentation: 8,
  attendance: 7,
  quiz: 15,
  mid: 25,
  final: 40,
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function calculateEstimationTotal(form) {
  const attendance =
    form.attendanceMode === "percent"
      ? (clamp(toNumber(form.attendancePercent), 0, 100) / 100) *
        MAX_MARKS.attendance
      : clamp(toNumber(form.attendanceMarks), 0, MAX_MARKS.attendance);

  const quizAverage =
    form.quizMode === "average"
      ? clamp(toNumber(form.quizAverage), 0, MAX_MARKS.quiz)
      : (() => {
          const count = clamp(toNumber(form.quizCount), 3, 4);
          const scores = form.quizScores
            .slice(0, count)
            .map((score) => clamp(toNumber(score), 0, MAX_MARKS.quiz));
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
    clamp(toNumber(form.assignment), 0, MAX_MARKS.assignment) +
    clamp(toNumber(form.presentation), 0, MAX_MARKS.presentation) +
    quizAverage +
    clamp(toNumber(form.mid), 0, MAX_MARKS.mid) +
    clamp(toNumber(form.final), 0, MAX_MARKS.final) +
    attendance;

  return Math.max(0, Math.min(100, total));
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("semester");
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [estimationForm, setEstimationForm] = useState(initialEstimationForm);
  const [manualSubjectForm, setManualSubjectForm] = useState(
    initialManualSubject
  );
  const [semesterName, setSemesterName] = useState("Semester 1");
  const [manualSemesterForm, setManualSemesterForm] = useState(
    initialManualSemester
  );

  const [estimationSubjects, setEstimationSubjects] = useLocalStorage(
    "cgpaMate_estimation_subjects",
    []
  );
  const [semesterSubjects, setSemesterSubjects] = useLocalStorage(
    "cgpaMate_semester_subjects",
    []
  );
  const [semesters, setSemesters] = useLocalStorage(
    "cgpaMate_semesters",
    []
  );

  const { toasts, addToast } = useToasts();

  const semesterStats = useMemo(() => {
    const credits = semesterSubjects.reduce(
      (sum, subject) => sum + toNumber(subject.credit),
      0
    );
    return {
      credits,
      cgpa: calculateWeightedGpa(semesterSubjects),
    };
  }, [semesterSubjects]);

  const totalStats = useMemo(() => {
    const credits = semesters.reduce(
      (sum, semester) => sum + toNumber(semester.credits),
      0
    );
    return {
      credits,
      cgpa: calculateWeightedGpa(semesters, "credits", "cgpa"),
    };
  }, [semesters]);

  const handleEstimationChange = (key, value) => {
    setEstimationForm((current) => ({
      ...current,
      [key]:
        key === "name" || key === "attendanceMode" || key === "quizMode"
          ? value
          : key === "quizScores"
          ? value
          : key === "quizCount"
          ? clamp(toNumber(value, current[key]), 3, 4)
          : toNumber(value, current[key]),
      quizConfirmed:
        key === "quizScores" || key === "quizCount" || key === "quizMode"
          ? false
          : current.quizConfirmed,
    }));
  };

  const handleManualSubjectChange = (key, value) => {
    setManualSubjectForm((current) => ({
      ...current,
      [key]: key === "name" ? value : toNumber(value, current[key]),
    }));
  };

  const handleManualSemesterChange = (key, value) => {
    setManualSemesterForm((current) => ({
      ...current,
      [key]: key === "name" ? value : toNumber(value, current[key]),
    }));
  };

  const addEstimationSubject = () => {
    if (!estimationForm.name.trim()) {
      addToast("Please add a subject name.", "warning");
      return;
    }

    const hasNegative = [
      estimationForm.credit,
      estimationForm.assignment,
      estimationForm.presentation,
      estimationForm.mid,
      estimationForm.final,
      estimationForm.attendancePercent,
      estimationForm.attendanceMarks,
      estimationForm.quizAverage,
      ...estimationForm.quizScores,
    ].some((value) => Number(value) < 0);

    if (hasNegative) {
      addToast("Please enter values greater than or equal to 0.", "warning");
      return;
    }

    const normalized = calculateEstimationTotal(estimationForm);
    const band = gradeFromScore(normalized);

    const newSubject = {
      id: `est-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: estimationForm.name.trim(),
      credit: estimationForm.credit,
      total: Number(normalized.toFixed(1)),
      grade: band.grade,
      gpa: band.gpa,
    };

    setEstimationSubjects((current) => [newSubject, ...current]);
    setEstimationForm(initialEstimationForm);
    addToast("Subject Added", "success");
  };

  const addEstimationToSemester = (subjectId) => {
    const subject = estimationSubjects.find((item) => item.id === subjectId);
    if (!subject) return;

    const exists = semesterSubjects.some(
      (item) => item.estimationId === subject.id
    );
    if (exists) {
      addToast("Already added to semester.", "warning");
      return;
    }

    const newSubject = {
      id: `sem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: subject.name,
      credit: subject.credit,
      gpa: subject.gpa,
      source: "estimation",
      estimationId: subject.id,
    };

    setSemesterSubjects((current) => [newSubject, ...current]);
    addToast("Added to Semester", "success");
    setActiveTab("semester");
  };

  const updateSemesterSubject = (id, patch) => {
    setSemesterSubjects((current) =>
      current.map((subject) =>
        subject.id === id ? { ...subject, ...patch } : subject
      )
    );
  };

  const removeSemesterSubject = (id) => {
    setSemesterSubjects((current) => current.filter((item) => item.id !== id));
  };

  const addManualSubject = () => {
    if (!manualSubjectForm.name.trim()) {
      addToast("Please add a subject name.", "warning");
      return;
    }

    const newSubject = {
      id: `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: manualSubjectForm.name.trim(),
      credit: manualSubjectForm.credit,
      gpa: manualSubjectForm.gpa,
      source: "manual",
    };

    setSemesterSubjects((current) => [newSubject, ...current]);
    setManualSubjectForm(initialManualSubject);
    addToast("Subject Added", "success");
  };

  const addSemesterToTotal = () => {
    if (semesterSubjects.length === 0) {
      addToast("Add subjects before adding a semester.", "warning");
      return;
    }

    const newSemester = {
      id: `tot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: semesterName || `Semester ${semesters.length + 1}`,
      cgpa: Number(semesterStats.cgpa.toFixed(2)),
      credits: semesterStats.credits || 0,
    };

    setSemesters((current) => [...current, newSemester]);
    addToast("Semester added to Total CGPA", "success");
    setActiveTab("total");
  };

  const updateSemester = (id, patch) => {
    setSemesters((current) =>
      current.map((semester) =>
        semester.id === id ? { ...semester, ...patch } : semester
      )
    );
  };

  const removeSemester = (id) => {
    setSemesters((current) => current.filter((item) => item.id !== id));
  };

  const addManualSemester = () => {
    if (!manualSemesterForm.name.trim()) {
      addToast("Please add a semester name.", "warning");
      return;
    }

    const newSemester = {
      id: `manual-sem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: manualSemesterForm.name.trim(),
      cgpa: manualSemesterForm.cgpa,
      credits: manualSemesterForm.credits,
    };

    setSemesters((current) => [...current, newSemester]);
    setManualSemesterForm(initialManualSemester);
    addToast("Semester Added", "success");
  };

  const removeEstimationSubject = (id) => {
    setEstimationSubjects((current) =>
      current.filter((subject) => subject.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-bg text-fg bg-gradient-panel">
      <Navbar
        onOpenAbout={() => setShowAbout(true)}
        onOpenContact={() => setShowContact(true)}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="mb-6 flex flex-col items-center justify-center space-y-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            CGPA Mate
          </p>
          <div className="max-w-6xl">
            <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-4xl lg:text-5xl">
              Build your CGPA with confidence.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base lg:text-base">
              Estimate grades, convert them into semester CGPA, and keep a
              clear view of your cumulative progress in one connected flow.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4 p-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const isEstimation = tab.id === "estimation";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300
                    ${isActive 
                        ? "bg-primary text-primary-fg shadow-lg shadow-primary/25 scale-105 text-white" 
                        : "bg-surface text-muted hover:bg-surface hover:text-fg"}
                    ${isEstimation && !isActive
                        ? "border border-amber-500/50  group"
                        : isActive && isEstimation 
                        ? " shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        : "border border-border/50"}
                  `}
                >
                  {isEstimation && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ring-2 ring-bg">
                      New Feature
                    </span>
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="space-y-6">
          {activeTab === "estimation" ? (
            <ResultEstimationTab
              form={estimationForm}
              onFormChange={handleEstimationChange}
              onAddSubject={addEstimationSubject}
              subjects={estimationSubjects}
              onAddToSemester={addEstimationToSemester}
              onRemoveSubject={removeEstimationSubject}
            />
          ) : null}
          {activeTab === "semester" ? (
            <SemesterCgpaTab
              subjects={semesterSubjects}
              manualForm={manualSubjectForm}
              onManualFormChange={handleManualSubjectChange}
              onAddManualSubject={addManualSubject}
              onUpdateSubject={updateSemesterSubject}
              onRemoveSubject={removeSemesterSubject}
              semesterName={semesterName}
              onSemesterNameChange={setSemesterName}
              onAddSemester={addSemesterToTotal}
              semesterStats={semesterStats}
            />
          ) : null}
          {activeTab === "total" ? (
            <TotalCgpaTab
              semesters={semesters}
              onUpdateSemester={updateSemester}
              onRemoveSemester={removeSemester}
              newSemesterForm={manualSemesterForm}
              onNewSemesterChange={handleManualSemesterChange}
              onAddManualSemester={addManualSemester}
              totalStats={totalStats}
            />
          ) : null}
        </div>
      </main>
      <Footer />

      <AboutPanel open={showAbout} onClose={() => setShowAbout(false)} />
      <ContactPanel open={showContact} onClose={() => setShowContact(false)} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
