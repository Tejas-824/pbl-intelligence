"use client";

import type { ApiData, Query } from "@/lib/types";
import { formatMonth } from "@/lib/format";

type Props = {
  options: ApiData["filters"];
  query: Query;
  onChange: (key: keyof Query, value: string) => void;
  onReset: () => void;
};

const GRADES = ["6", "7", "8"];
const SUBJECTS = ["Science", "Math"];

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {children}
      </select>
    </label>
  );
}

export default function Filters({ options, query, onChange, onReset }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Select
          label="Reporting month"
          value={query.month}
          onChange={(v) => onChange("month", v)}
        >
          {options.months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </Select>

        <Select
          label="District"
          value={query.district}
          onChange={(v) => onChange("district", v)}
        >
          <option value="all">All districts</option>
          {options.districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select
          label="Block"
          value={query.block}
          onChange={(v) => onChange("block", v)}
        >
          <option value="all">All blocks</option>
          {options.blocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>

        <Select
          label="Grade"
          value={query.grade}
          onChange={(v) => onChange("grade", v)}
        >
          <option value="all">All grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              Class {g}
            </option>
          ))}
        </Select>

        <Select
          label="Subject"
          value={query.subject}
          onChange={(v) => onChange("subject", v)}
        >
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <button
        onClick={onReset}
        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        Reset filters
      </button>
    </section>
  );
}