export const gradeScale = [
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

export function gradeFromScore(score) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    gradeScale.find((band) => normalized >= band.min) ??
    gradeScale[gradeScale.length - 1]
  );
}

export function nextGradeTarget(score) {
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  const sorted = [...gradeScale].sort((a, b) => a.min - b.min);
  return sorted.find((band) => band.min > normalized) ?? null;
}

export function calculateWeightedGpa(items, creditKey = "credit", gpaKey = "gpa") {
  const totals = items.reduce(
    (acc, item) => {
      const credit = Number(item[creditKey]) || 0;
      const gpa = Number(item[gpaKey]) || 0;
      return {
        credits: acc.credits + credit,
        points: acc.points + credit * gpa,
      };
    },
    { credits: 0, points: 0 }
  );

  return totals.credits > 0 ? totals.points / totals.credits : 0;
}
