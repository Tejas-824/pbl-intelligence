import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

function readCsv(file: string, header: boolean) {
  const text = fs.readFileSync(file, "utf8");
  return Papa.parse<any>(text, {
    header,
    skipEmptyLines: true,
    dynamicTyping: header, // grant files have clean headers, PBL files don't
  }).data;
}

const yes = (v: string) => v.trim().toLowerCase() === "yes";

async function seedPbl() {
  const dir = path.join(dataDir, "pbl");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".csv"));

  const rows: any[] = [];
  for (const f of files) {
    // PBL headers are long survey questions, so read by column position
    const data = readCsv(path.join(dir, f), false).slice(1);
    for (const r of data) {
      rows.push({
        month: r[0],
        schoolName: r[2],
        schoolCode: r[3],
        district: r[4],
        block: r[5],
        conducted: yes(r[6]),
        evidence: yes(r[7]),
        classes: r[8],
        subject: r[9],
        enrolled6: Number(r[10]),
        sci6: Number(r[11]),
        math6: Number(r[12]),
        enrolled7: Number(r[13]),
        sci7: Number(r[14]),
        math7: Number(r[15]),
        enrolled8: Number(r[16]),
        sci8: Number(r[17]),
        math8: Number(r[18]),
        totalEnrollment: Number(r[19]),
        totalAttendance: Number(r[20]),
        attendanceRate: Number(r[21]),
        riskStatus: r[22],
      });
    }
  }

  await prisma.schoolResponse.deleteMany();
  await prisma.schoolResponse.createMany({ data: rows });
  console.log(`school responses: ${rows.length}`);
}

async function seedGrants() {
  const dir = path.join(dataDir, "grants");

  const finance = readCsv(path.join(dir, "01_Grant_Profile_and_Finance.csv"), true);
  await prisma.grantFinance.deleteMany();
  await prisma.grantFinance.createMany({
    data: finance.map((r) => ({
      grantId: r.grant_id,
      donor: r.donor,
      grantName: r.grant_name,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      coveredDistricts: r.covered_districts,
      month: r.reporting_month,
      budgetLine: r.budget_line,
      approvedUnits: r.approved_budget_units,
      monthlyUnits: r.monthly_utilized_units,
      cumulativeUnits: r.cumulative_utilized_units,
      utilizationRate: r.cumulative_utilization_rate,
      financeNote: r.finance_note,
    })),
  });
  console.log(`grant finance: ${finance.length}`);

  const perf = readCsv(path.join(dir, "02_Grant_Performance_and_Report_Material.csv"), true);
  await prisma.grantPerformance.deleteMany();
  await prisma.grantPerformance.createMany({
    data: perf.map((r) => ({
      grantId: r.grant_id,
      donor: r.donor,
      grantName: r.grant_name,
      month: r.reporting_month,
      periodEndDate: r.period_end_date,
      reportDueDate: r.report_due_date,
      reportStatus: r.report_status,
      coveredDistricts: r.covered_districts,
      sampledSchools: r.sampled_school_records,
      schoolsCompleted: r.schools_completed_pbl,
      completionRate: r.pbl_completion_rate,
      schoolsWithEvidence: r.schools_with_evidence,
      evidenceRate: r.evidence_submission_rate,
      totalEnrollment: r.total_enrollment,
      totalAttendance: r.total_attendance,
      attendanceRate: r.attendance_rate,
      riskStatus: r.risk_status,
      milestoneSummary: r.milestone_summary,
      draftReportText: r.draft_report_text,
    })),
  });
  console.log(`grant performance: ${perf.length}`);

  const media = readCsv(path.join(dir, "03_Evidence_and_Media_Index.csv"), true);
  await prisma.evidenceMedia.deleteMany();
  await prisma.evidenceMedia.createMany({
    data: media.map((r) => ({
      recordId: r.record_id,
      recordType: r.record_type,
      grantId: r.grant_id,
      donor: r.donor,
      month: r.reporting_month,
      district: r.district,
      title: r.title,
      caption: r.summary_or_caption,
      fileName: r.file_name,
      relativePath: r.relative_path,
      usageNote: r.usage_note,
    })),
  });
  console.log(`evidence media: ${media.length}`);
}

async function main() {
  await seedPbl();
  await seedGrants();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());