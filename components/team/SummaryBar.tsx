import { Coins, Rows3 } from "lucide-react";
import { formatMinorUnits } from "@/lib/orders/money";
import type { ColumnDefinition } from "@/lib/orders/orderTypes";

interface SummaryBarProps {
  visibleCount: number;
  totalCount: number;
  columns: ColumnDefinition[];
  totals: Record<string, number>;
}

/** Row count and the total of every money column for the rows currently shown. */
export default function SummaryBar({ visibleCount, totalCount, columns, totals }: SummaryBarProps) {
  const moneyColumns = columns.filter((column) => column.type === "money");
  // Visual only: share of rows currently shown. Guards against dividing by zero.
  const shownPercent = totalCount === 0 ? 0 : Math.round((visibleCount / totalCount) * 100);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#d5daf7] bg-white p-4 text-sm text-[#1e1b4b] dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#eef0ff]">
      <div className="flex items-center gap-3 rounded-xl bg-[#e0e3ff] px-3.5 py-2 text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
        <Rows3 className="size-4" aria-hidden="true" />
        <span className="font-semibold">
          Showing {visibleCount} of {totalCount} rows
        </span>
        <span
          role="presentation"
          aria-hidden="true"
          className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/70 sm:block dark:bg-[#14173a]"
        >
          <span
            className="block h-full rounded-full bg-[#4f46e5] transition-all duration-500 motion-reduce:transition-none dark:bg-[#818cf8]"
            style={{ width: `${shownPercent}%` }}
          />
        </span>
      </div>

      {moneyColumns.map((column) => (
        <span
          key={column.key}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d5daf7] bg-[#f4f6ff] px-3 py-2 font-medium tabular-nums transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0d9488] hover:bg-[#d5f3ef] motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:border-[#2dd4bf] dark:hover:bg-[#1b4552]"
        >
          <Coins className="size-3.5 text-[#0d9488] dark:text-[#2dd4bf]" aria-hidden="true" />
          <span className="text-[#5b5f8a] dark:text-[#a3a8d6]">{column.label}:</span>
          <span className="font-semibold text-[#0d9488] dark:text-[#2dd4bf]">
            {formatMinorUnits(totals[column.key] ?? 0)}
          </span>
        </span>
      ))}
    </div>
  );
}