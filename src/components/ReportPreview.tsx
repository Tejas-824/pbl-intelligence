"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { GrantData } from "@/lib/types";
import { buildGrantReport } from "@/lib/narrative";

export default function ReportPreview({ data }: { data: GrantData }) {
  const report = useMemo(() => buildGrantReport(data), [data]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(report.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Report preview</h2>
            <p className="text-xs text-slate-500">
              Rule-based narrative. Works with AI off. Tags like [F1] point to the source facts.
            </p>
          </div>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy report"}
          </button>
        </div>

        <div className="space-y-4">
          {report.sections.map((s) => (
            <div key={s.heading}>
              <h3 className="text-sm font-semibold text-indigo-700">{s.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Source facts</h2>
        <p className="mb-3 text-xs text-slate-500">Computed from data, not written by AI.</p>

        <ul className="space-y-3">
          {report.facts.map((f) => (
            <li key={f.id} className="text-sm">
              <p>
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                  {f.id}
                </span>
                <span className="font-medium">{f.label}</span>
              </p>
              <p className="text-slate-700">{f.value}</p>
              <p className="text-xs text-slate-400">{f.source}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}