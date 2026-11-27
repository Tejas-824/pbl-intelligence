import type { SchoolResponse } from "@prisma/client";
import { getRisk, worstRisk, RiskStatus } from "./risk";

export type Metrics = {
  totalSchools: number;
  participating: number;
  participationPct: number;
  evidenceSchools: number;
  evidencePct: number;
  enrollment: number;
  attendance: number;
  attendancePct: number;
  risk: {
    participation: RiskStatus;
    evidence: RiskStatus;
    attendance: RiskStatus;
    overall: RiskStatus;
  };
};

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);

export function computeMetrics(
  rows: SchoolResponse[],
  grade = "all",
  subject = "all"
): Metrics {
  const grades = grade === "all" ? [6, 7, 8] : [Number(grade)];
  const subjects = subject === "all" ? ["Science", "Math"] : [subject];

  let participating = 0;
  let evidenceSchools = 0;
  let enrollment = 0;
  let attendance = 0;

  for (const r of rows) {
    const perGrade: Record<number, { enr: number; sci: number; math: number }> = {
      6: { enr: r.enrolled6, sci: r.sci6, math: r.math6 },
      7: { enr: r.enrolled7, sci: r.sci7, math: r.math7 },
      8: { enr: r.enrolled8, sci: r.sci8, math: r.math8 },
    };

    // a school counts only if it ran PBL for the selected grade and subject
    const gradeOk = grades.some((g) => r.classes.includes(String(g)));
    const subjectOk = subjects.some((s) => r.subject.includes(s));
    const counted = r.conducted && gradeOk && subjectOk;

    if (counted) participating++;
    if (counted && r.evidence) evidenceSchools++;

    for (const g of grades) {
      enrollment += perGrade[g].enr;
      if (subjects.includes("Science")) attendance += perGrade[g].sci;
      if (subjects.includes("Math")) attendance += perGrade[g].math;
    }
  }

  const totalSchools = rows.length;
  const participationPct = pct(participating, totalSchools);
  const evidencePct = pct(evidenceSchools, totalSchools);
  // one session per subject per student, so denominator = enrollment x subjects
  const attendancePct = pct(attendance, enrollment * subjects.length);

  const risk = {
    participation: getRisk(participationPct),
    evidence: getRisk(evidencePct),
    attendance: getRisk(attendancePct),
  };

  return {
    totalSchools,
    participating,
    participationPct,
    evidenceSchools,
    evidencePct,
    enrollment,
    attendance,
    attendancePct,
    risk: { ...risk, overall: worstRisk(Object.values(risk)) },
  };
}

// metrics per district or block, worst performers first
export function groupMetrics(
  rows: SchoolResponse[],
  key: "district" | "block",
  grade = "all",
  subject = "all"
) {
  const groups = new Map<string, SchoolResponse[]>();
  for (const r of rows) {
    const list = groups.get(r[key]) ?? [];
    list.push(r);
    groups.set(r[key], list);
  }

  return [...groups.entries()]
    .map(([name, list]) => ({ name, ...computeMetrics(list, grade, subject) }))
    .sort((a, b) => a.participationPct - b.participationPct);
}

// "2025-09" -> "2025-08"
export function previousMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}