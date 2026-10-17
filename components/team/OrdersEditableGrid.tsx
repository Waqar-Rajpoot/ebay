"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SearchX, UserPen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateColumnValue } from "@/lib/orders/calculatedColumns";
import { formatSourceValue } from "@/lib/orders/formatters";
import { formatMinorUnits } from "@/lib/orders/money";
import { MAX_EDITOR_NAME_LENGTH, ROWS_PER_PAGE } from "@/lib/orders/orderConstants";
import { DEFAULT_ROW_FILTERS, filterOrderRows, type OrderRowFilters } from "@/lib/orders/orderFilters";
import { summarizeRows } from "@/lib/orders/orderMetrics";
import type { BatchDetails, OrderRowDto } from "@/lib/orders/orderTypes";
import EditableCell from "./EditableCell";
import OrderFilters from "./OrderFilters";
import SummaryBar from "./SummaryBar";
import { useEditorName } from "./useEditorName";

/** Shared flat styles. Full class names so Tailwind can detect them. */
const MUTED_TEXT_CLASS = "text-[#5b5f8a] dark:text-[#a3a8d6]";
const BORDER_CLASS = "border-[#d5daf7] dark:border-[#333a7a]";
const HEAD_TEXT_CLASS = "text-xs font-semibold uppercase tracking-wide text-[#5b5f8a] dark:text-[#a3a8d6]";
const FIELD_CLASS =
  "h-11 rounded-xl border-[#d5daf7] bg-white transition-colors focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/30 dark:border-[#333a7a] dark:bg-[#1e2250] dark:focus-visible:border-[#818cf8] dark:focus-visible:ring-[#818cf8]/30";
const PAGE_BUTTON_CLASS =
  "group inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d5daf7] bg-white px-3.5 text-sm font-semibold transition-all duration-200 hover:border-[#4f46e5] hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40";

interface OrdersEditableGridProps {
  batch: BatchDetails;
  initialRows: OrderRowDto[];
}

/** The team's working grid: original columns on the left, an input box per row in each added column. */
export default function OrdersEditableGrid({ batch, initialRows }: OrdersEditableGridProps) {
  const [rows, setRows] = useState(initialRows);
  const [filters, setFilters] = useState<OrderRowFilters>(DEFAULT_ROW_FILTERS);
  // Rows are matched when the filter changes, so a row does not vanish while you are still typing in it.
  const [matchingRowIds, setMatchingRowIds] = useState(() => new Set(initialRows.map((row) => row.id)));
  const [pageIndex, setPageIndex] = useState(0);
  const { editorName, setEditorName } = useEditorName();

  const filteredRows = useMemo(() => rows.filter((row) => matchingRowIds.has(row.id)), [rows, matchingRowIds]);
  const totals = useMemo(() => summarizeRows(filteredRows, batch.addedColumns), [filteredRows, batch.addedColumns]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const visibleRows = filteredRows.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE);

  function handleFiltersChange(nextFilters: OrderRowFilters) {
    setFilters(nextFilters);
    setMatchingRowIds(new Set(filterOrderRows(rows, nextFilters, batch.addedColumns).map((row) => row.id)));
    setPageIndex(0);
  }

  function handleRowChange(updatedRow: OrderRowDto) {
    setRows((previous) => previous.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
  }

  return (
    <div className="space-y-5 text-[#1e1b4b] dark:text-[#eef0ff]">
      {/* Entrance animation, disabled for reduced motion. */}
      <style>{`
        @keyframes orders-grid-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .orders-grid-rise { animation: orders-grid-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .orders-grid-rise { animation: none; }
        }
      `}</style>

      <div
        className={`orders-grid-rise flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-white p-5 dark:bg-[#1e2250] ${BORDER_CLASS}`}
      >
        <OrderFilters filters={filters} onChange={handleFiltersChange} />
        <div className="space-y-2">
          <Label htmlFor="editor-name" className="flex items-center gap-1.5 text-sm font-medium">
            <UserPen className="size-3.5 text-[#0d9488] dark:text-[#2dd4bf]" aria-hidden="true" />
            Your name (needed to edit)
          </Label>
          <Input
            id="editor-name"
            value={editorName}
            onChange={(event) => setEditorName(event.target.value)}
            maxLength={MAX_EDITOR_NAME_LENGTH}
            placeholder="For example Sara"
            className={`w-56 ${FIELD_CLASS}`}
          />
        </div>
      </div>

      <div className="orders-grid-rise" style={{ animationDelay: "80ms" }}>
        <SummaryBar
          visibleCount={filteredRows.length}
          totalCount={rows.length}
          columns={batch.addedColumns}
          totals={totals}
        />
      </div>

      <div
        className={`orders-grid-rise overflow-x-auto rounded-2xl border bg-white dark:bg-[#1e2250] ${BORDER_CLASS}`}
        style={{ animationDelay: "160ms" }}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-[#d5daf7] bg-[#f4f6ff] hover:bg-[#f4f6ff] dark:border-[#333a7a] dark:bg-[#252a60] dark:hover:bg-[#252a60]">
              <TableHead className={`w-12 ${HEAD_TEXT_CLASS}`}>#</TableHead>
              {batch.columns.map((header) => (
                <TableHead key={header} className={HEAD_TEXT_CLASS}>
                  {header}
                </TableHead>
              ))}
              {batch.addedColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="bg-[#d5f3ef] text-xs font-semibold uppercase tracking-wide text-[#0d9488] dark:bg-[#1b4552] dark:text-[#2dd4bf]"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={batch.columns.length + batch.addedColumns.length + 1} className="h-40 text-center">
                  <span className="flex flex-col items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#e0e3ff] text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
                      <SearchX className="size-6" aria-hidden="true" />
                    </span>
                    <span className={`text-sm font-medium ${MUTED_TEXT_CLASS}`}>No rows match your filters.</span>
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-[#d5daf7] transition-colors hover:bg-[#f4f6ff] motion-reduce:transition-none dark:border-[#333a7a] dark:hover:bg-[#252a60]"
                >
                  <TableCell className={`tabular-nums ${MUTED_TEXT_CLASS}`}>{row.rowNumber}</TableCell>
                  {row.sourceValues.map((value, index) => (
                    <TableCell key={index} className="max-w-64 truncate" title={formatSourceValue(value)}>
                      {formatSourceValue(value)}
                    </TableCell>
                  ))}
                  {batch.addedColumns.map((column) => {
                    if (column.kind === "input") {
                      return (
                        <TableCell key={column.key}>
                          <EditableCell row={row} column={column} editorName={editorName} onRowChange={handleRowChange} />
                        </TableCell>
                      );
                    }
                    const value = calculateColumnValue(column, row.addedValues);
                    return (
                      <TableCell key={column.key} className="font-semibold tabular-nums text-[#0d9488] dark:text-[#2dd4bf]">
                        {value === null ? "-" : formatMinorUnits(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${BORDER_CLASS} ${MUTED_TEXT_CLASS}`}>
          Page {currentPage + 1} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={PAGE_BUTTON_CLASS}
            disabled={currentPage === 0}
            onClick={() => setPageIndex(currentPage - 1)}
          >
            <ChevronLeft
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
            Previous
          </button>
          <button
            type="button"
            className={PAGE_BUTTON_CLASS}
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPageIndex(currentPage + 1)}
          >
            Next
            <ChevronRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
}