"use client";

import { Button, Card, Input, SectionCard, StatPill } from "./ui";

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
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-xl font-semibold text-fg">
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
        subtitle="Track all semesters and see the final CGPA at a glance."
        action={
          <Button onClick={onAddManualSemester} className="w-full sm:w-auto">
            Add Semester
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {semesters.length === 0 ? (
              <p className="text-sm text-muted">
                No semesters yet. Add a semester from the Semester tab or
                manually add one here.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {semesters.map((semester) => (
                  <Card key={semester.id}>
                    <div className="flex items-start justify-between gap-3">
                      <Input
                        label="Semester"
                        value={semester.name}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { name: value })
                        }
                      />
                      <button
                        className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                        onClick={() => onRemoveSemester(semester.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Input
                        label="CGPA"
                        type="number"
                        min={0}
                        max={4}
                        step={0.01}
                        value={semester.cgpa}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { cgpa: value })
                        }
                      />
                      <Input
                        label="Credits"
                        type="number"
                        min={1}
                        max={30}
                        step={1}
                        value={semester.credits}
                        onChange={(value) =>
                          onUpdateSemester(semester.id, { credits: value })
                        }
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="space-y-4">
            <CircularGauge value={totalStats.cgpa} />
            <StatPill label="Total Credits" value={totalStats.credits} />
            <StatPill
              label="Final CGPA"
              value={totalStats.cgpa.toFixed(2)}
              tone="success"
            />
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Input
            label="Semester Name"
            value={newSemesterForm.name}
            onChange={(value) => onNewSemesterChange("name", value)}
          />
          <Input
            label="CGPA"
            type="number"
            min={0}
            max={4}
            step={0.01}
            value={newSemesterForm.cgpa}
            onChange={(value) => onNewSemesterChange("cgpa", value)}
          />
          <Input
            label="Credits"
            type="number"
            min={1}
            max={30}
            step={1}
            value={newSemesterForm.credits}
            onChange={(value) => onNewSemesterChange("credits", value)}
          />
        </div>
      </SectionCard>
    </div>
  );
}
