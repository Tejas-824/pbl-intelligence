import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";
import { explainRisk } from "@/lib/risk";

// "Name: Status (Owner) | Name: Status (Owner)" -> list
function parseMilestones(text: string) {
  return text.split("|").map((part) => {
    const m = part.trim().match(/^(.+?):\s*(.+?)\s*\((.+)\)$/);
    return m
      ? { name: m[1], status: m[2], owner: m[3] }
      : { name: part.trim(), status: "Unknown", owner: "" };
  });
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const perfAll = await prisma.grantPerformance.findMany({
    orderBy: [{ grantId: "asc" }, { month: "asc" }],
  });

  // one entry per grant for the dropdown
  const grants: { grantId: string; grantName: string; donor: string; districts: string[] }[] = [];
  for (const p of perfAll) {
    if (!grants.some((g) => g.grantId === p.grantId)) {
      grants.push({
        grantId: p.grantId,
        grantName: p.grantName,
        donor: p.donor,
        districts: p.coveredDistricts.split("; "),
      });
    }
  }

  const grantId = sp.get("grant") || grants[0].grantId;
  const months = perfAll.filter((p) => p.grantId === grantId).map((p) => p.month);
  const month = sp.get("month") || months[months.length - 1];

  const perf = perfAll.find((p) => p.grantId === grantId && p.month === month);
  if (!perf) {
    return NextResponse.json({ error: "Grant or month not found" }, { status: 404 });
  }

  const districts = perf.coveredDistricts.split("; ");

  const [finance, media, responses] = await Promise.all([
    prisma.grantFinance.findMany({ where: { grantId, month } }),
    prisma.evidenceMedia.findMany({ where: { grantId, month } }),
    prisma.schoolResponse.findMany({ where: { month, district: { in: districts } } }),
  ]);

  // facts are computed from school data, not taken from the draft text
  const metrics = computeMetrics(responses);

  const approved = finance.reduce((s, f) => s + f.approvedUnits, 0);
  const monthly = finance.reduce((s, f) => s + f.monthlyUnits, 0);
  const cumulative = finance.reduce((s, f) => s + f.cumulativeUnits, 0);

  const milestones = parseMilestones(perf.milestoneSummary);

  // risks are rule-based: weak indicators and milestones not completed
  const risks: string[] = [];
  const indicators = [
    { key: "participation", label: "PBL completion", pct: metrics.participationPct },
    { key: "evidence", label: "Evidence submission", pct: metrics.evidencePct },
    { key: "attendance", label: "Attendance", pct: metrics.attendancePct },
  ] as const;
  for (const i of indicators) {
    if (metrics.risk[i.key] !== "On Track") risks.push(explainRisk(i.label, i.pct));
  }
  for (const m of milestones) {
    if (m.status !== "Completed") {
      risks.push(`${m.name} is ${m.status} (owner: ${m.owner}).`);
    }
  }

  return NextResponse.json({
    options: { grants, months },
    selected: { grantId, month },
    grant: {
      name: perf.grantName,
      donor: perf.donor,
      districts,
      reportStatus: perf.reportStatus,
      reportDueDate: perf.reportDueDate,
      periodEnd: perf.periodEndDate,
    },
    metrics,
    // values stored in the grant csv, kept to cross-check our numbers
    reported: {
      completion: perf.completionRate * 100,
      evidence: perf.evidenceRate * 100,
      attendance: perf.attendanceRate * 100,
      riskStatus: perf.riskStatus,
    },
    finance: {
      lines: finance,
      approved,
      monthly,
      cumulative,
      utilizationPct: approved > 0 ? (cumulative / approved) * 100 : 0,
    },
    milestones,
    risks,
    media,
  });
}