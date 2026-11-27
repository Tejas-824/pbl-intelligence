import type { ApiData } from "./types";
import type { RiskStatus } from "./risk";
import { fmtPct } from "./format";
import { score, weakest } from "./summary";

export type Priority = "High" | "Medium" | "Low";
export type ActionStatus = "Open" | "In progress" | "Done";

export type Action = {
  title: string;
  owner: string;
  priority: Priority;
  dueDate: string;
  status: ActionStatus;
  metric: string; // the number this action should move
};

const priorityOf = (r: RiskStatus): Priority =>
  r === "Critical" || r === "At Risk" ? "High" : r === "Behind" ? "Medium" : "Low";

const DUE_DAYS: Record<Priority, number> = { High: 7, Medium: 14, Low: 30 };

const OWNER: Record<string, string> = {
  participation: "District Program Lead",
  "evidence submission": "M&E Lead",
  attendance: "Field Coordinator",
};

const STEP: Record<string, (name: string) => string> = {
  participation: (n) => `Plan follow-up visits to schools in ${n} that did not run PBL`,
  "evidence submission": (n) => `Collect missing PBL evidence from schools in ${n}`,
  attendance: (n) => `Review attendance problems with schools in ${n}`,
};

export function buildActions(d: ApiData, today = new Date()): Action[] {
  const c = d.current;
  const s = d.selected;
  const geo = s.district === "all" ? d.districts : d.blocks;
  const actions: Action[] = [];

  function add(title: string, owner: string, risk: RiskStatus, metric: string) {
    if (risk === "On Track") return;
    const priority = priorityOf(risk);
    const due = new Date(today);
    due.setDate(due.getDate() + DUE_DAYS[priority]);
    actions.push({
      title,
      owner,
      priority,
      dueDate: due.toISOString().slice(0, 10),
      status: "Open",
      metric,
    });
  }

  const byScore = [...geo].sort((a, b) => score(a) - score(b));

  // 1. weakest geography, on its weakest indicator
  if (byScore[0]) {
    const g = byScore[0];
    const w = weakest(g);
    add(STEP[w.label](g.name), OWNER[w.label], g.risk.overall, `${g.name} ${w.label}: ${fmtPct(w.pct)}`);
  }

  // 2. schools ran PBL but did not submit evidence
  if (c.participationPct - c.evidencePct > 10) {
    add(
      "Chase evidence from schools that ran PBL but did not submit it",
      OWNER["evidence submission"],
      c.risk.evidence,
      `Evidence submission: ${fmtPct(c.evidencePct)}`
    );
  }

  // 3. second weakest geography
  if (byScore[1]) {
    const g = byScore[1];
    const w = weakest(g);
    add(STEP[w.label](g.name), OWNER[w.label], g.risk.overall, `${g.name} ${w.label}: ${fmtPct(w.pct)}`);
  }

  // 4. weakest grade
  if (s.grade === "all") {
    const g = [...d.byGrade].sort((a, b) => score(a) - score(b))[0];
    const w = weakest(g);
    add(`Plan extra support for ${g.name} PBL sessions`, "Academic Lead", g.risk.overall, `${g.name} ${w.label}: ${fmtPct(w.pct)}`);
  }

  // 5. weakest subject
  if (s.subject === "all") {
    const g = [...d.bySubject].sort((a, b) => score(a) - score(b))[0];
    const w = weakest(g);
    add(`Review ${g.name} PBL delivery with facilitators`, "Academic Lead", g.risk.overall, `${g.name} ${w.label}: ${fmtPct(w.pct)}`);
  }

  return actions.slice(0, 5);
}