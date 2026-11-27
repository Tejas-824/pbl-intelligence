"use client";

import { useEffect, useState } from "react";
import Filters from "./Filters";
import type { ApiData, Query } from "@/lib/types";

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

      <div className={loading ? "opacity-50 transition" : "transition"}>
        <p className="text-sm text-slate-600">
          {data.current.totalSchools} schools in this view
        </p>
      </div>
    </div>
  );
}