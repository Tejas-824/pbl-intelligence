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
};