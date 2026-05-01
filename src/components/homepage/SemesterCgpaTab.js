"use client";

import { Button, Card, Input, SectionCard, StatPill } from "./ui";

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
  return (
    <div className="space-y-6">
      <SectionCard
        title="Semester CGPA"
        subtitle="Manage subjects added from the estimator or add new subjects manually."
        action={
          <Button onClick={onAddSemester} className="w-full sm:w-auto">
            Add to Total CGPA
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {subjects.length === 0 ? (
              <p className="text-sm text-muted">
                No subjects in this semester. Add from the estimator or manually
                add below.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {subjects.map((subject) => (
                  <Card key={subject.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">
                          {subject.source === "estimation"
                            ? "From estimator"
                            : "Manual"}
                        </p>
                        <Input
                          label="Name"
                          value={subject.name}
                          onChange={(value) =>
                            onUpdateSubject(subject.id, { name: value })
                          }
                        />
                      </div>
                      <button
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                        onClick={() => onRemoveSubject(subject.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Credit"
                        type="number"
                        min={1}
                        max={6}
                        step={0.5}
                        value={subject.credit}
                        onChange={(value) =>
                          onUpdateSubject(subject.id, { credit: value })
                        }
                      />
                      <Input
                        label="GPA"
                        type="number"
                        min={0}
                        max={4}
                        step={0.01}
                        value={subject.gpa}
                        onChange={(value) =>
                          onUpdateSubject(subject.id, { gpa: value })
                        }
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-fg">Manual Subject</h3>
            <Input
              label="Subject Name"
              value={manualForm.name}
              onChange={(value) => onManualFormChange("name", value)}
            />
            <Input
              label="Credit"
              type="number"
              min={1}
              max={6}
              step={0.5}
              value={manualForm.credit}
              onChange={(value) => onManualFormChange("credit", value)}
            />
            <Input
              label="GPA"
              type="number"
              min={0}
              max={4}
              step={0.01}
              value={manualForm.gpa}
              onChange={(value) => onManualFormChange("gpa", value)}
            />
            <Button variant="outline" onClick={onAddManualSubject}>
              Add Subject
            </Button>
          </Card>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatPill label="Semester Credits" value={semesterStats.credits} />
          <StatPill
            label="Semester CGPA"
            value={semesterStats.cgpa.toFixed(2)}
            tone="success"
          />
          <div className="min-w-55 flex-1">
            <Input
              label="Semester Name"
              value={semesterName}
              onChange={onSemesterNameChange}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
