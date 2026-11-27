import { RISK_STYLES, RiskStatus } from "@/lib/risk";

export default function RiskBadge({ status }: { status: RiskStatus }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${RISK_STYLES[status]}`}
    >
      {status}
    </span>
  );
}