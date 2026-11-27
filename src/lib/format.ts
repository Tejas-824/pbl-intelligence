// "2025-07" -> "Jul 2025"
export function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export const fmtNum = (n: number) => n.toLocaleString("en-IN");