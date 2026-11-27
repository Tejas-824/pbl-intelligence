"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ApiData } from "@/lib/types";
import { formatMonth } from "@/lib/format";

export default function TrendChart({ trend }: { trend: ApiData["trend"] }) {
  const data = trend.map((t) => ({
    month: formatMonth(t.month),
    Participation: Number(t.participationPct.toFixed(1)),
    Evidence: Number(t.evidencePct.toFixed(1)),
    Attendance: Number(t.attendancePct.toFixed(1)),
  }));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Monthly trend</h2>
      <p className="mb-4 text-xs text-slate-500">
        Dashed line marks the 75% On Track threshold.
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="Participation" stroke="#4f46e5" strokeWidth={2} />
            <Line type="monotone" dataKey="Evidence" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="Attendance" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}