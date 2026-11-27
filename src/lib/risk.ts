export type RiskStatus = "On Track" | "Behind" | "At Risk" | "Critical";

// order matters: index 0 is best, last is worst
export const RISK_ORDER: RiskStatus[] = ["On Track", "Behind", "At Risk", "Critical"];

// value is a percentage, 0 to 100
export function getRisk(value: number): RiskStatus {
  if (value >= 75) return "On Track";
  if (value >= 60) return "Behind";
  if (value >= 35) return "At Risk";
  return "Critical";
}

// minimum % needed to reach each status
const CUTOFF: Record<RiskStatus, number> = {
  "On Track": 75,
  Behind: 60,
  "At Risk": 35,
  Critical: 0,
};

// explains why a value got its status, and how far it is from the next one
export function explainRisk(label: string, value: number): string {
  const status = getRisk(value);
  const pct = value.toFixed(1);
  if (status === "On Track") {
    return `${label} is ${pct}%, which is On Track (75% or above).`;
  }
  const next = RISK_ORDER[RISK_ORDER.indexOf(status) - 1];
  const gap = (CUTOFF[next] - value).toFixed(1);
  return `${label} is ${pct}%, which is ${status}. It needs ${gap} more points to reach ${next}.`;
}

// overall status for a geography = its weakest indicator
export function worstRisk(statuses: RiskStatus[]): RiskStatus {
  return statuses.reduce((worst, s) =>
    RISK_ORDER.indexOf(s) > RISK_ORDER.indexOf(worst) ? s : worst
  );
}

// tailwind classes used by badges in the UI
export const RISK_STYLES: Record<RiskStatus, string> = {
  "On Track": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Behind: "bg-amber-100 text-amber-800 border-amber-200",
  "At Risk": "bg-orange-100 text-orange-800 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
};