import type { GrantData } from "./types";
import { fmtNum, fmtPct, formatMonth } from "./format";

export type Fact = { id: string; label: string; value: string; source: string };
export type Section = { heading: string; text: string; factIds: string[] };
export type Report = { facts: Fact[]; sections: Section[]; plainText: string };

export function buildGrantReport(d: GrantData): Report {
  const m = d.metrics;
  const month = formatMonth(d.selected.month);
  const done = d.milestones.filter((x) => x.status === "Completed").length;
  const notes = [...new Set(d.finance.lines.map((l) => l.financeNote))];

  // every number in the report comes from this list
  const facts: Fact[] = [
    {
      id: "F1",
      label: "PBL completion",
      value: `${fmtPct(m.participationPct)} (${fmtNum(m.participating)} of ${fmtNum(m.totalSchools)} schools)`,
      source: "School responses, covered districts",
    },
    {
      id: "F2",
      label: "Evidence submission",
      value: `${fmtPct(m.evidencePct)} (${fmtNum(m.evidenceSchools)} schools)`,
      source: "School responses, covered districts",
    },
    {
      id: "F3",
      label: "Attendance rate",
      value: `${fmtPct(m.attendancePct)} (${fmtNum(m.attendance)} sessions, ${fmtNum(m.enrollment)} students enrolled)`,
      source: "School responses, covered districts",
    },
    {
      id: "F4",
      label: "Overall risk status",
      value: m.risk.overall,
      source: "Risk rules applied to F1, F2, F3",
    },
    {
      id: "F5",
      label: "Budget utilization",
      value: `${fmtNum(d.finance.cumulative)} of ${fmtNum(d.finance.approved)} units (${fmtPct(d.finance.utilizationPct)})`,
      source: "Grant finance file",
    },
    {
      id: "F6",
      label: "Spend this month",
      value: `${fmtNum(d.finance.monthly)} units`,
      source: "Grant finance file",
    },
    {
      id: "F7",
      label: "Milestones",
      value: `${done} of ${d.milestones.length} completed`,
      source: "Grant performance file",
    },
    {
      id: "F8",
      label: "Linked evidence assets",
      value: d.media.length ? d.media.map((x) => x.recordId).join(", ") : "none",
      source: "Evidence and media index",
    },
    {
      id: "F9",
      label: "Report status",
      value: `${d.grant.reportStatus}, due ${d.grant.reportDueDate}`,
      source: "Grant performance file",
    },
  ];

  const sections: Section[] = [
    {
      heading: "Overview",
      text: `${d.grant.name} (${d.grant.donor}) covers ${d.grant.districts.join(", ")}. For ${month}, the program is rated ${m.risk.overall} [F4]. The report status is ${d.grant.reportStatus}, due ${d.grant.reportDueDate} [F9].`,
      factIds: ["F4", "F9"],
    },
    {
      heading: "Program delivery",
      text: `PBL was completed in ${fmtPct(m.participationPct)} of schools [F1]. Evidence was submitted by ${fmtPct(m.evidencePct)} of schools [F2], and attendance across PBL sessions was ${fmtPct(m.attendancePct)} [F3].`,
      factIds: ["F1", "F2", "F3"],
    },
    {
      heading: "Finance",
      text: `${fmtNum(d.finance.cumulative)} of ${fmtNum(d.finance.approved)} approved budget units (${fmtPct(d.finance.utilizationPct)}) were utilized by the end of ${month} [F5], including ${fmtNum(d.finance.monthly)} units this month [F6]. Finance notes: ${notes.join(", ")}.`,
      factIds: ["F5", "F6"],
    },
    {
      heading: "Milestones",
      text: `${done} of ${d.milestones.length} milestones are completed [F7]. ${d.milestones
        .map((x) => `${x.name}: ${x.status} (${x.owner})`)
        .join("; ")}.`,
      factIds: ["F7"],
    },
    {
      heading: "Risks",
      text: d.risks.length
        ? d.risks.join(" ")
        : "No risks were flagged by the rules for this month.",
      factIds: ["F1", "F2", "F3", "F7"],
    },
    {
      heading: "Evidence",
      text: d.media.length
        ? `${d.media.length} evidence asset(s) are linked for ${month} [F8]: ${d.media
            .map((x) => `${x.title} (${x.recordId}, ${x.district})`)
            .join("; ")}.`
        : `No evidence assets are linked for ${month} [F8].`,
      factIds: ["F8"],
    },
  ];

  const plainText = [
    `${d.grant.name} - ${month}`,
    ...sections.map((s) => `${s.heading}\n${s.text}`),
    "Source facts",
    ...facts.map((f) => `${f.id}: ${f.label} - ${f.value} (${f.source})`),
  ].join("\n\n");

  return { facts, sections, plainText };
}