import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Columns3, KeyRound, Table2 } from "lucide-react";
import ColumnManager from "@/components/columns/ColumnManager";
import PageHeader from "@/components/shared/PageHeader";
import { ROUTES, teamBatchRoute } from "@/lib/constants";
import { findBatchDetails } from "@/lib/orders/batchQueries";
import { formatDateTime } from "@/lib/orders/formatters";
import { ROW_NUMBER_KEY } from "@/lib/orders/orderConstants";
import DeleteBatchButton from "./DeleteBatchButton";
import ExportButton from "./ExportButton";

const MUTED_TEXT_CLASS = "text-[#5b5f8a] dark:text-[#a3a8d6]";
const BORDER_CLASS = "border-[#d5daf7] dark:border-[#333a7a]";

/** Admin view of one sheet: details, export, delete, and column management. */
export default async function AdminBatchDetail({ batchId }: { batchId: string }) {
  const batch = await findBatchDetails(batchId);
  if (!batch) notFound();

  const keyColumnLabel = batch.keyColumn === ROW_NUMBER_KEY ? "Row number" : batch.keyColumn;

  return (
    <div className="min-h-screen bg-[#eef1ff] text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Entrance animation, disabled for reduced motion. */}
      <style>{`
        @keyframes batch-detail-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .batch-detail-rise { opacity: 0; animation: batch-detail-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .batch-detail-rise { animation: none; opacity: 1; }
        }
      `}</style>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div className="batch-detail-rise">
          <PageHeader
            title={batch.name}
            description={`${batch.rowCount} orders from ${batch.originalFileName}`}
            backHref={ROUTES.admin}
            backLabel="All sheets"
            actions={
              <>
                <Link
                  href={teamBatchRoute(batch.id)}
                  className="group inline-flex h-9 items-center gap-2 rounded-xl border border-[#d5daf7] bg-white px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4f46e5] hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40"
                >
                  <Table2
                    className="size-4 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  Open grid
                </Link>
                <ExportButton batchId={batch.id} />
                <DeleteBatchButton batchId={batch.id} batchName={batch.name} />
              </>
            }
          />
        </div>

        <section
          className={`batch-detail-rise overflow-hidden rounded-2xl border bg-white dark:bg-[#1e2250] ${BORDER_CLASS}`}
          style={{ animationDelay: "100ms" }}
        >
          <header className={`flex items-start gap-4 border-b p-6 ${BORDER_CLASS}`}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e0e3ff] text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
              <Table2 className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold tracking-tight">Sheet details</h2>
              <p className={`text-sm ${MUTED_TEXT_CLASS}`}>Overview of the uploaded file.</p>
            </div>
          </header>

          <div className="space-y-6 p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div
                className={`flex items-center gap-4 rounded-xl border bg-[#f4f6ff] p-4 transition-colors duration-200 hover:border-[#4f46e5] dark:bg-[#252a60] dark:hover:border-[#818cf8] ${BORDER_CLASS}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#4f46e5] dark:bg-[#1e2250] dark:text-[#818cf8]">
                  <KeyRound className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${MUTED_TEXT_CLASS}`}>
                    Order ID column
                  </dt>
                  <dd className="truncate text-sm font-semibold">{keyColumnLabel}</dd>
                </div>
              </div>

              <div
                className={`flex items-center gap-4 rounded-xl border bg-[#f4f6ff] p-4 transition-colors duration-200 hover:border-[#0d9488] dark:bg-[#252a60] dark:hover:border-[#2dd4bf] ${BORDER_CLASS}`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#0d9488] dark:bg-[#1e2250] dark:text-[#2dd4bf]">
                  <CalendarDays className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${MUTED_TEXT_CLASS}`}>Uploaded</dt>
                  <dd className="truncate text-sm font-semibold">{formatDateTime(batch.createdAt)}</dd>
                </div>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Columns3 className="size-4 text-[#4f46e5] dark:text-[#818cf8]" aria-hidden="true" />
                Original columns
                <span className="rounded-full bg-[#e0e3ff] px-2 py-0.5 text-xs font-semibold text-[#4f46e5] dark:bg-[#2c3270] dark:text-[#818cf8]">
                  {batch.columns.length}
                </span>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {batch.columns.map((column) => (
                  <li
                    key={column}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:border-[#4f46e5] hover:text-[#4f46e5] dark:hover:border-[#818cf8] dark:hover:text-[#818cf8] ${BORDER_CLASS} ${MUTED_TEXT_CLASS}`}
                  >
                    {column}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="batch-detail-rise" style={{ animationDelay: "200ms" }}>
          <ColumnManager batchId={batch.id} columns={batch.addedColumns} />
        </div>
      </main>
    </div>
  );
}