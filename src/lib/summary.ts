import type { ApiData, Group } from "./types";
import { fmtPct, formatMonth } from "./format";
import { explainRisk } from "./risk";

export type SummarySection = { heading: string; items: string[] };

// one score per group so we can rank them
export const score = (g: Group) => (g.participationPct + g.evidencePct + g.attendancePct) / 3;

export function weakest(g: Group) {
  const list = [
    { label: "participation", pct: g.participationPct },
    { label: "evidence submission", pct: g.evidencePct },
    { label: "attendance", pct: g.attendancePct },
  ];
  return list.reduce((a, b) => (b.pct < a.pct ? b : a));
}

export function buildReviewSummary(d: ApiData) {
  const c = d.current;
  const changes = d.changes;
  const s = d.selected;

  const level = s.district === "all" ? "district" : "block";
  const geo = s.district === "all" ? d.districts : d.blocks;

  const scope = [
    s.block !== "all" ? s.block : s.district !== "all" ? s.district : "all districts",
    s.grade !== "all" ? `Class ${s.grade}` : null,
    s.subject !== "all" ? s.subject : null,
  ]
    .filter(Boolean)
    .join(", ");

  const indicators = [
    { key: "participation", label: "Participation", pct: c.participationPct },
    { key: "evidence", label: "Evidence submission", pct: c.evidencePct },
    { key: "attendance", label: "Attendance", pct: c.attendancePct },
  ] as const;

  // achievements
  const achievements: string[] = [];
  for (const i of indicators) {
    if (c.risk[i.key] === "On Track") {
      achievements.push(`${i.label} is ${fmtPct(i.pct)}, which is On Track.`);
    }
  }
  if (changes) {
    const gains = indicators
      .map((i) => ({ label: i.label, delta: changes[i.key] }))
      .filter((x) => x.delta > 0.05)
      .sort((a, b) => b.delta - a.delta);
    if (gains[0]) {
      achievements.push(
        `${gains[0].label} improved the most, up ${gains[0].delta.toFixed(1)} pts since last month.`
      );
    }
  }
  const best = [...geo].sort((a, b) => score(b) - score(a))[0];
  if (best && geo.length > 1) {
    achievements.push(
      `${best.name} is the strongest ${level} (${best.risk.overall}, average ${fmtPct(score(best))}).`
    );
  }
  if (achievements.length === 0) {
    achievements.push("No indicator is On Track yet for this view.");
  }

  // month over month
  const movement = changes
    ? indicators.map((i) => {
        const delta = changes[i.key];
        const dir =
          Math.abs(delta) < 0.05
            ? "was flat"
            : delta > 0
            ? `rose ${delta.toFixed(1)} pts`
            : `fell ${Math.abs(delta).toFixed(1)} pts`;
        return `${i.label} ${dir} to ${fmtPct(i.pct)}.`;
      })
    : ["There is no earlier month in the data to compare with."];

  // risks
  const risks = indicators
    .filter((i) => c.risk[i.key] !== "On Track")
    .map((i) => explainRisk(i.label, i.pct));
  if (geo.length > 1) {
    const flagged = geo.filter(
      (g) => g.risk.overall === "At Risk" || g.risk.overall === "Critical"
    );
    risks.push(`${flagged.length} of ${geo.length} ${level}s are At Risk or Critical.`);
  }
  if (risks.length === 0) risks.push("No indicator is below the On Track threshold.");

  // priority areas
  const worst = [...geo].sort((a, b) => score(a) - score(b)).slice(0, 3);
  const priority = worst.map((g) => {
    const w = weakest(g);
    return `${g.name} (${g.risk.overall}): weakest on ${w.label} at ${fmtPct(w.pct)}.`;
  });
  if (s.grade === "all") {
    const g = [...d.byGrade].sort((a, b) => score(a) - score(b))[0];
    priority.push(`${g.name} has the lowest overall score (${fmtPct(score(g))}).`);
  }
  if (s.subject === "all") {
    const g = [...d.bySubject].sort((a, b) => score(a) - score(b))[0];
    priority.push(`${g.name} has the lowest overall score (${fmtPct(score(g))}).`);
  }

  // discussion points
  const talk: string[] = [];
  if (worst[0]) {
    const w = weakest(worst[0]);
    talk.push(
      `What is holding back ${w.label} in ${worst[0].name}, and what support does the team need there?`
    );
  }
  if (c.participationPct - c.evidencePct > 15) {
    talk.push(
      `PBL ran in ${fmtPct(c.participationPct)} of schools but only ${fmtPct(c.evidencePct)} submitted evidence. What is blocking submission?`
    );
  }
  if (changes) {
    const drop = indicators
      .map((i) => ({ label: i.label, delta: changes[i.key] }))
      .sort((a, b) => a.delta - b.delta)[0];
    if (drop.delta < -0.05) {
      talk.push(
        `${drop.label} fell ${Math.abs(drop.delta).toFixed(1)} pts since last month. What changed on the ground?`
      );
    }
  }
  if (c.risk.attendance !== "On Track") {
    talk.push(
      `Attendance is ${fmtPct(c.attendancePct)}. Which grades or schools should get follow-up first?`
    );
  }
  talk.push(`Which ${level} should get the next field visit, and who owns it?`);

  const sections: SummarySection[] = [
    { heading: "Achievements", items: achievements },
    { heading: "Change from last month", items: movement },
    { heading: "Risks", items: risks },
    { heading: "Priority areas", items: priority },
    { heading: "Discussion points", items: talk.slice(0, 5) },
  ];

  const title = `${formatMonth(s.month)} review: ${scope}`;
  const plainText = [
    title,
    ...sections.map((x) => `${x.heading}\n${x.items.map((i) => `- ${i}`).join("\n")}`),
  ].join("\n\n");

  return { title, sections, plainText };
}

