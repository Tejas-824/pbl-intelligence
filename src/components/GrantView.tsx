"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { GrantData } from "@/lib/types";
import KpiCard from "./KpiCard";
import ReportPreview from "./ReportPreview";
import RiskBadge from "./RiskBadge";
import { explainRisk } from "@/lib/risk";
import { fmtNum, fmtPct, formatMonth } from "@/lib/format";

const statusStyle = (s: string) =>
  s === "Completed"
    ? "bg-emerald-100 text-emerald-800"
    : s === "At Risk"
    ? "bg-orange-100 text-orange-800"
    : "bg-amber-100 text-amber-800";

export default function GrantView() {
  const [sel, setSel] = useState({ grant: "", month: "" });
  const [data, setData] = useState<GrantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (sel.grant) params.set("grant", sel.grant);
    if (sel.month) params.set("month", sel.month);

    setLoading(true);
    fetch(`/api/grants?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load grant data");
        return r.json();
      })
      .then((d: GrantData) => {
        if (cancelled) return;
        setData(d);
        setError("");
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [sel]);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  if (!data) return <p className="p-4 text-slate-500">Loading grant data...</p>;

  const m = data.metrics;

  // computed numbers should match what the grant file reports
  const matches =
    Math.abs(data.reported.completion - m.participationPct) < 0.1 &&
    Math.abs(data.reported.evidence - m.evidencePct) < 0.1 &&
    Math.abs(data.reported.attendance - m.attendancePct) < 0.1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Grant Reporting Assistant</h1>
        <p className="text-sm text-slate-500">
          Pick a grant and month to assemble a report section from facts and evidence.
        </p>
      </div>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Grant
          <select
            value={data.selected.grantId}
            onChange={(e) => setSel({ grant: e.target.value, month: "" })}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {data.options.grants.map((g) => (
              <option key={g.grantId} value={g.grantId}>
                {g.grantName} ({g.donor})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Reporting month
          <select
            value={data.selected.month}
            onChange={(e) => setSel({ grant: data.selected.grantId, month: e.target.value })}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {data.options.months.map((mo) => (
              <option key={mo} value={mo}>
                {formatMonth(mo)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className={loading ? "space-y-6 opacity-50 transition" : "space-y-6 transition"}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <RiskBadge status={m.risk.overall} />
          <span>Districts: {data.grant.districts.join(", ")}</span>
          <span className="text-slate-400">|</span>
          <span>
            {data.grant.reportStatus}, due {data.grant.reportDueDate}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="PBL completion"
            value={fmtPct(m.participationPct)}
            risk={m.risk.participation}
            explain={explainRisk("Completion", m.participationPct)}
          />
          <KpiCard
            label="Evidence submission"
            value={fmtPct(m.evidencePct)}
            risk={m.risk.evidence}
            explain={explainRisk("Evidence", m.evidencePct)}
          />
          <KpiCard
            label="Attendance rate"
            value={fmtPct(m.attendancePct)}
            risk={m.risk.attendance}
            explain={explainRisk("Attendance", m.attendancePct)}
          />
          <KpiCard
            label="Budget utilization"
            value={fmtPct(data.finance.utilizationPct)}
            hint={`${fmtNum(data.finance.cumulative)} of ${fmtNum(data.finance.approved)} units`}
          />
        </div>

        <p className={`text-xs ${matches ? "text-emerald-600" : "text-amber-600"}`}>
          {matches
            ? "Computed values match the figures in the grant file."
            : "Computed values differ from the grant file. Check the source data."}
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold">
              Finance by budget line (units)
            </h3>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Line</th>
                  <th className="px-2 py-2 font-medium">Approved</th>
                  <th className="px-2 py-2 font-medium">Month</th>
                  <th className="px-4 py-2 font-medium">Used</th>
                </tr>
              </thead>
              <tbody>
                {data.finance.lines.map((l) => (
                  <tr key={l.budgetLine} className="border-t border-slate-100">
                    <td className="px-4 py-2">{l.budgetLine}</td>
                    <td className="px-2 py-2">{fmtNum(l.approvedUnits)}</td>
                    <td className="px-2 py-2">{fmtNum(l.monthlyUnits)}</td>
                    <td className="px-4 py-2">{fmtPct(l.utilizationRate * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">Milestones</h3>
              <ul className="space-y-2">
                {data.milestones.map((x) => (
                  <li key={x.name} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      {x.name} <span className="text-slate-400">({x.owner})</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(x.status)}`}>
                      {x.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold">Risks</h3>
              {data.risks.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {data.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No risks flagged for this month.</p>
              )}
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Linked evidence and media</h3>
          {data.media.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.media.map((x) => (
                <figure key={x.recordId} className="overflow-hidden rounded-lg border border-slate-200">
                  <Image
                    src={`/${x.relativePath}`}
                    alt={x.title}
                    width={600}
                    height={400}
                    className="h-48 w-full bg-slate-100 object-contain"
                  />
                  <figcaption className="space-y-1 p-3 text-xs text-slate-600">
                    <p className="font-medium text-slate-900">
                      {x.title} <span className="text-slate-400">({x.recordId})</span>
                    </p>
                    <p>{x.caption}</p>
                    <p className="text-slate-400">{x.usageNote}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No evidence assets are linked to this grant for {formatMonth(data.selected.month)}.
            </p>
          )}
        </section>

        <ReportPreview data={data} />
      </div>
    </div>
  );
}