import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import RiskBadge from "./RiskBadge";
import type { RiskStatus } from "@/lib/risk";

type Props = {
  label: string;
  value: string;
  hint?: string;
  risk?: RiskStatus;
  explain?: string; // why this status, shown on hover
  change?: number | null; // points vs last month
};

export default function KpiCard({ label, value, hint, risk, explain, change }: Props) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      title={explain}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {risk && <RiskBadge status={risk} />}
      </div>

      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {change != null && <Change value={change} />}
        {hint && <span className="text-slate-400">{hint}</span>}
      </div>

      {explain && <p className="mt-2 text-xs text-slate-500">{explain}</p>}
    </div>
  );
}

function Change({ value }: { value: number }) {
  const flat = Math.abs(value) < 0.05;
  const up = value > 0;

  const color = flat ? "text-slate-500" : up ? "text-emerald-600" : "text-red-600";
  const Icon = flat ? Minus : up ? ArrowUp : ArrowDown;

  return (
    <span className={`flex items-center gap-0.5 font-medium ${color}`}>
      <Icon size={14} />
      {Math.abs(value).toFixed(1)} pts vs last month
    </span>
  );
}