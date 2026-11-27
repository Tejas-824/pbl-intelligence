"use client";

import { useEffect, useState } from "react";
import Filters from "./Filters";
import type { ApiData, Query } from "@/lib/types";
import KpiCard from "./KpiCard";
import { explainRisk } from "@/lib/risk";
import { fmtNum, fmtPct } from "@/lib/format";
import GeoPerformance from "./GeoPerformance";

const DEFAULT_QUERY: Query = {
  month: "", // empty = API picks the latest month
  district: "all",
  block: "all",
  grade: "all",
  subject: "all",
};

export default function Dashboard() {
  const [query, setQuery] = useState<Query>(DEFAULT_QUERY);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v && params.set(k, v));

    setLoading(true);
    fetch(`/api/metrics?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load metrics");
        return r.json();
      })
      .then((d: ApiData) => {
        if (cancelled) return;
        setData(d);
        setError("");
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    // ignore stale responses when filters change quickly
    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleChange(key: keyof Query, value: string) {
    setQuery((q) => ({
      ...q,
      [key]: value,
      // a block belongs to one district, so clear it on district change
      ...(key === "district" ? { block: "all" } : {}),
    }));
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>;
  }

  if (!data) {
    return <p className="p-4 text-slate-500">Loading dashboard...</p>;
  }

  // month is empty until the user picks one, so show what the API chose
  const shown: Query = { ...query, month: query.month || data.selected.month };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Monthly Program Review</h1>
        <p className="text-sm text-slate-500">
          Track PBL participation, evidence and attendance across geographies.
        </p>
      </div>

      <Filters
        options={data.filters}
        query={shown}
        onChange={handleChange}
        onReset={() => setQuery(DEFAULT_QUERY)}
      />

      <div
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${
          loading ? "opacity-50 transition" : "transition"
        }`}
      >
        <KpiCard label="Total schools" value={fmtNum(data.current.totalSchools)} />

        <KpiCard
          label="Participating schools"
          value={fmtNum(data.current.participating)}
          hint="ran PBL this month"
        />

        <KpiCard
          label="Participation"
          value={fmtPct(data.current.participationPct)}
          risk={data.current.risk.participation}
          explain={explainRisk("Participation", data.current.participationPct)}
          change={data.changes?.participation}
        />

        <KpiCard
          label="Evidence submission"
          value={fmtPct(data.current.evidencePct)}
          risk={data.current.risk.evidence}
          explain={explainRisk("Evidence submission", data.current.evidencePct)}
          change={data.changes?.evidence}
        />

        <KpiCard
          label="Total enrollment"
          value={fmtNum(data.current.enrollment)}
          hint="students"
        />

        <KpiCard
          label="Attendance"
          value={fmtNum(data.current.attendance)}
          hint="student sessions"
        />

        <KpiCard
          label="Attendance rate"
          value={fmtPct(data.current.attendancePct)}
          risk={data.current.risk.attendance}
          explain={explainRisk("Attendance", data.current.attendancePct)}
          change={data.changes?.attendance}
        />
      </div>

      <GeoPerformance
        districts={data.districts}
        blocks={data.blocks}
        onPick={(key, name) => {
          handleChange(key, name);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}