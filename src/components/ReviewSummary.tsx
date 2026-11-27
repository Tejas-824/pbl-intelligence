"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ApiData } from "@/lib/types";
import { buildReviewSummary } from "@/lib/summary";

export default function ReviewSummary({ data }: { data: ApiData }) {
  const summary = buildReviewSummary(data);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(summary.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Review meeting summary</h2>
          <p className="text-xs text-slate-500">{summary.title}. Built from the numbers above by rules.</p>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy summary"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {summary.sections.map((s) => (
          <div key={s.heading} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-indigo-700">{s.heading}</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}