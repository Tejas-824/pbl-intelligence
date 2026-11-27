import { NextResponse } from "next/server";
import type { SchoolResponse } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeMetrics, groupMetrics, previousMonth } from "@/lib/metrics";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;

  const monthRows = await prisma.schoolResponse.findMany({
    distinct: ["month"],
    select: { month: true },
    orderBy: { month: "asc" },
  });
  const months = monthRows.map((m) => m.month);

  const month = sp.get("month") || months[months.length - 1];
  const district = sp.get("district") || "all";
  const block = sp.get("block") || "all";
  const grade = sp.get("grade") || "all";
  const subject = sp.get("subject") || "all";

  const prevMonth = previousMonth(month);
  const [currAll, prevAll] = await Promise.all([
    prisma.schoolResponse.findMany({ where: { month } }),
    prisma.schoolResponse.findMany({ where: { month: prevMonth } }),
  ]);

  const inScope = (r: SchoolResponse) =>
    (district === "all" || r.district === district) &&
    (block === "all" || r.block === block);

  const currRows = currAll.filter(inScope);
  const prevRows = prevAll.filter(inScope);

  const current = computeMetrics(currRows, grade, subject);
  const previous = prevRows.length ? computeMetrics(prevRows, grade, subject) : null;

  // movement in percentage points vs last month
  const changes = previous && {
    participation: current.participationPct - previous.participationPct,
    evidence: current.evidencePct - previous.evidencePct,
    attendance: current.attendancePct - previous.attendancePct,
  };

  // districts ignore the district/block filter so they can be compared
  const districts = groupMetrics(currAll, "district", grade, subject);
  const blocks = groupMetrics(
    currAll.filter((r) => district === "all" || r.district === district),
    "block",
    grade,
    subject
  );

  const districtList = [...new Set(currAll.map((r) => r.district))].sort();
  const blockList = [
    ...new Set(
      currAll
        .filter((r) => district === "all" || r.district === district)
        .map((r) => r.block)
    ),
  ].sort();

    // all months for the same district/block/grade/subject, for the trend chart
  const scopeRows = await prisma.schoolResponse.findMany({
    where: {
      ...(district !== "all" && { district }),
      ...(block !== "all" && { block }),
    },
  });
  const trend = months.map((m) => ({
    month: m,
    ...computeMetrics(
      scopeRows.filter((r) => r.month === m),
      grade,
      subject
    ),
  }));

  return NextResponse.json({
    filters: { months, districts: districtList, blocks: blockList },
    selected: { month, district, block, grade, subject },
    current,
    previous,
    changes,
    districts,
    blocks,
    trend,
  });
}