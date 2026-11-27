"use client";

import { useState } from "react";
import type { Group } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { fmtPct } from "@/lib/format";

type Props = {
  districts: Group[];
  blocks: Group[];
  onPick: (key: "district" | "block", name: string) => void;
};

// one score per geography so we can rank them
const score = (g: Group) =>
  (g.participationPct + g.evidencePct + g.attendancePct) / 3;

function Table({
  title,
  rows,
  tone,
  onPick,
}: {
  title: string;
  rows: Group[];
  tone: "bad" | "good";
  onPick: (name: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <h3
        className={`border-b border-slate-100 px-4 py-3 text-sm font-semibold ${
          tone === "bad" ? "text-red-700" : "text-emerald-700"
        }`}
      >
        {title}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Particip.</th>
              <th className="px-2 py-2 font-medium">Evidence</th>
              <th className="px-2 py-2 font-medium">Attend.</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr
                key={g.name}
                onClick={() => onPick(g.name)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-2 font-medium">{g.name}</td>
                <td className="px-2 py-2">{fmtPct(g.participationPct)}</td>
                <td className="px-2 py-2">{fmtPct(g.evidencePct)}</td>
                <td className="px-2 py-2">{fmtPct(g.attendancePct)}</td>
                <td className="px-4 py-2">
                  <RiskBadge status={g.risk.overall} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GeoPerformance({ districts, blocks, onPick }: Props) {
  const [tab, setTab] = useState<"district" | "block">("district");

  const list = tab === "district" ? districts : blocks;
  const sorted = [...list].sort((a, b) => score(a) - score(b));

  const low = sorted.slice(0, 5);
  // avoid showing the same row in both tables when the list is short
  const high = sorted.slice(Math.max(5, sorted.length - 5)).reverse();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Geography performance</h2>
          <p className="text-xs text-slate-500">
            Ranked by average of participation, evidence and attendance. Click a row to filter.
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
          {(["district", "block"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 font-medium capitalize ${
                tab === t ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
              }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Table
          title="Needs follow-up first"
          rows={low}
          tone="bad"
          onPick={(name) => onPick(tab, name)}
        />
        {high.length > 0 && (
          <Table
            title="Performing well"
            rows={high}
            tone="good"
            onPick={(name) => onPick(tab, name)}
          />
        )}
      </div>
    </section>
  );
}