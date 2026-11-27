import type { Metrics } from "./metrics";

export type Group = Metrics & { name: string };

export type Change = {
  participation: number;
  evidence: number;
  attendance: number;
};

export type Query = {
  month: string;
  district: string;
  block: string;
  grade: string;
  subject: string;
};

export type ApiData = {
  filters: { months: string[]; districts: string[]; blocks: string[] };
  selected: Query;
  current: Metrics;
  previous: Metrics | null;
  changes: Change | null;
  districts: Group[];
  blocks: Group[];
  trend: (Metrics & { month: string })[];
};

export type Milestone = { name: string; status: string; owner: string };

export type GrantData = {
  options: {
    grants: { grantId: string; grantName: string; donor: string; districts: string[] }[];
    months: string[];
  };
  selected: { grantId: string; month: string };
  grant: {
    name: string;
    donor: string;
    districts: string[];
    reportStatus: string;
    reportDueDate: string;
    periodEnd: string;
  };
  metrics: Metrics;
  reported: { completion: number; evidence: number; attendance: number; riskStatus: string };
  finance: {
    lines: {
      budgetLine: string;
      approvedUnits: number;
      monthlyUnits: number;
      cumulativeUnits: number;
      utilizationRate: number;
      financeNote: string;
    }[];
    approved: number;
    monthly: number;
    cumulative: number;
    utilizationPct: number;
  };
  milestones: Milestone[];
  risks: string[];
  media: {
    recordId: string;
    recordType: string;
    district: string;
    title: string;
    caption: string;
    relativePath: string;
    usageNote: string;
  }[];
};