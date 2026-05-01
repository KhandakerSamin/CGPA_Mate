export type GradeBand = {
  min: number;
  grade: string;
  gpa: number;
};

export const gradeScale: GradeBand[] = [
  { min: 80, grade: "A+", gpa: 4.0 },
  { min: 75, grade: "A", gpa: 3.75 },
  { min: 70, grade: "A-", gpa: 3.5 },
  { min: 65, grade: "B+", gpa: 3.25 },
  { min: 60, grade: "B", gpa: 3.0 },
  { min: 55, grade: "B-", gpa: 2.75 },
  { min: 50, grade: "C+", gpa: 2.5 },
  { min: 45, grade: "C", gpa: 2.25 },
  { min: 40, grade: "D", gpa: 2.0 },
  { min: 0, grade: "F", gpa: 0.0 },
];

export function gradeFromScore(score: number): GradeBand {
  const normalized = Math.max(0, Math.min(100, score));
  return gradeScale.find((band) => normalized >= band.min) ?? gradeScale[gradeScale.length - 1];
}

export function nextGradeTarget(score: number): GradeBand | null {
  const normalized = Math.max(0, Math.min(100, score));
  const sorted = [...gradeScale].sort((a, b) => a.min - b.min);
  return sorted.find((band) => band.min > normalized) ?? null;
}
