-- CreateTable
CREATE TABLE "SchoolResponse" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolCode" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "conducted" BOOLEAN NOT NULL,
    "evidence" BOOLEAN NOT NULL,
    "classes" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "enrolled6" INTEGER NOT NULL,
    "sci6" INTEGER NOT NULL,
    "math6" INTEGER NOT NULL,
    "enrolled7" INTEGER NOT NULL,
    "sci7" INTEGER NOT NULL,
    "math7" INTEGER NOT NULL,
    "enrolled8" INTEGER NOT NULL,
    "sci8" INTEGER NOT NULL,
    "math8" INTEGER NOT NULL,
    "totalEnrollment" INTEGER NOT NULL,
    "totalAttendance" INTEGER NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "riskStatus" TEXT NOT NULL,

    CONSTRAINT "SchoolResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantFinance" (
    "id" SERIAL NOT NULL,
    "grantId" TEXT NOT NULL,
    "donor" TEXT NOT NULL,
    "grantName" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "coveredDistricts" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "budgetLine" TEXT NOT NULL,
    "approvedUnits" DOUBLE PRECISION NOT NULL,
    "monthlyUnits" DOUBLE PRECISION NOT NULL,
    "cumulativeUnits" DOUBLE PRECISION NOT NULL,
    "utilizationRate" DOUBLE PRECISION NOT NULL,
    "financeNote" TEXT NOT NULL,

    CONSTRAINT "GrantFinance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrantPerformance" (
    "id" SERIAL NOT NULL,
    "grantId" TEXT NOT NULL,
    "donor" TEXT NOT NULL,
    "grantName" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "periodEndDate" TEXT NOT NULL,
    "reportDueDate" TEXT NOT NULL,
    "reportStatus" TEXT NOT NULL,
    "coveredDistricts" TEXT NOT NULL,
    "sampledSchools" INTEGER NOT NULL,
    "schoolsCompleted" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "schoolsWithEvidence" INTEGER NOT NULL,
    "evidenceRate" DOUBLE PRECISION NOT NULL,
    "totalEnrollment" INTEGER NOT NULL,
    "totalAttendance" INTEGER NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "riskStatus" TEXT NOT NULL,
    "milestoneSummary" TEXT NOT NULL,
    "draftReportText" TEXT NOT NULL,

    CONSTRAINT "GrantPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceMedia" (
    "id" SERIAL NOT NULL,
    "recordId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "donor" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "relativePath" TEXT NOT NULL,
    "usageNote" TEXT NOT NULL,

    CONSTRAINT "EvidenceMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolResponse_month_district_block_idx" ON "SchoolResponse"("month", "district", "block");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolResponse_month_schoolCode_key" ON "SchoolResponse"("month", "schoolCode");

-- CreateIndex
CREATE INDEX "GrantFinance_grantId_month_idx" ON "GrantFinance"("grantId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "GrantPerformance_grantId_month_key" ON "GrantPerformance"("grantId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceMedia_recordId_key" ON "EvidenceMedia"("recordId");

-- CreateIndex
CREATE INDEX "EvidenceMedia_grantId_month_idx" ON "EvidenceMedia"("grantId", "month");
