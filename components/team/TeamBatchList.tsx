import Link from "next/link";
import { ArrowRight, CalendarDays, FileSpreadsheet, Rows3 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { ROUTES, teamBatchRoute } from "@/lib/constants";
import { listBatchSummaries } from "@/lib/orders/batchQueries";
import { formatDateTime } from "@/lib/orders/formatters";

/** Team home: the sheets the team can work on. */
export default async function TeamBatchList() {
  const batches = await listBatchSummaries();

  return (
    <div className="min-h-screen bg-[#eef1ff] text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Entrance animation, disabled for reduced motion. */}
      <style>{`
        @keyframes team-list-rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes team-list-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .team-list-rise { opacity: 0; animation: team-list-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .team-list-bob { animation: team-list-bob 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .team-list-rise { animation: none; opacity: 1; }
          .team-list-bob { animation: none; }
        }
      `}</style>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <div className="team-list-rise">
          <PageHeader
            title="Team"
            description="Pick a sheet and fill in the prices."
            backHref={ROUTES.home}
            backLabel="Home"
          />
        </div>

        {batches.length === 0 ? (
          <section
            className="team-list-rise flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-[#d5daf7] bg-white px-6 py-16 text-center dark:border-[#333a7a] dark:bg-[#1e2250]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="team-list-bob flex size-16 items-center justify-center rounded-2xl bg-[#d5f3ef] text-[#0d9488] dark:bg-[#1b4552] dark:text-[#2dd4bf]">
              <FileSpreadsheet className="size-8" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">No sheets yet</h2>
              <p className="text-sm text-[#5b5f8a] dark:text-[#a3a8d6]">The admin has not uploaded a sheet yet.</p>
            </div>
          </section>
        ) : (
          <>
            <p className="team-list-rise text-sm font-medium text-[#5b5f8a] dark:text-[#a3a8d6]" style={{ animationDelay: "80ms" }}>
              {batches.length} {batches.length === 1 ? "sheet" : "sheets"} available
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              {batches.map((batch, index) => (
                <Link
                  key={batch.id}
                  href={teamBatchRoute(batch.id)}
                  className="team-list-rise group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-[#d5daf7] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0d9488] hover:bg-[#d5f3ef] hover:shadow-xl focus-visible:-translate-y-1.5 focus-visible:border-[#0d9488] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:hover:border-[#2dd4bf] dark:hover:bg-[#1b4552] dark:focus-visible:border-[#2dd4bf] dark:focus-visible:ring-[#2dd4bf]/40"
                  style={{ animationDelay: `${140 + index * 80}ms` }}
                >
                  {/* Flat accent bar that slides in on hover. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#0d9488] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none dark:bg-[#2dd4bf]"
                  />

                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#d5f3ef] text-[#0d9488] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#0d9488] group-hover:text-white motion-reduce:transition-none dark:bg-[#1b4552] dark:text-[#2dd4bf] dark:group-hover:bg-[#2dd4bf] dark:group-hover:text-[#14173a]">
                      <FileSpreadsheet className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="pt-1 text-lg font-semibold leading-snug tracking-tight">{batch.name}</h2>
                  </div>

                  <ul className="flex flex-wrap gap-2 text-xs font-medium text-[#5b5f8a] dark:text-[#a3a8d6]">
                    <li className="inline-flex items-center gap-1.5 rounded-full border border-[#d5daf7] px-3 py-1 transition-colors group-hover:border-[#0d9488] group-hover:text-[#0d9488] dark:border-[#333a7a] dark:group-hover:border-[#2dd4bf] dark:group-hover:text-[#2dd4bf]">
                      <Rows3 className="size-3.5" aria-hidden="true" />
                      {batch.rowCount} orders
                    </li>
                    <li className="inline-flex items-center gap-1.5 rounded-full border border-[#d5daf7] px-3 py-1 transition-colors group-hover:border-[#0d9488] group-hover:text-[#0d9488] dark:border-[#333a7a] dark:group-hover:border-[#2dd4bf] dark:group-hover:text-[#2dd4bf]">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      Uploaded {formatDateTime(batch.createdAt)}
                    </li>
                  </ul>

                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#0d9488] dark:text-[#2dd4bf]">
                    Open sheet
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}