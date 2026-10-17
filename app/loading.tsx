const BLOCK_CLASS = "loading-pulse rounded-lg bg-[#e0e3ff] dark:bg-[#2c3270]";

const PLACEHOLDER_ROW_COUNT = 5;

/** Shown while a page streams in. The shapes mirror the signed-in page layout. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#eef1ff] text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Pulse animation, disabled for reduced motion. */}
      <style>{`
        @keyframes loading-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .loading-pulse { animation: loading-pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .loading-pulse { animation: none; }
        }
      `}</style>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10" aria-busy="true">
        <p className="sr-only" role="status">
          Loading
        </p>

        {/* Header: back pill, title, description, action */}
        <div className="space-y-5 border-b border-[#d5daf7] pb-6 dark:border-[#333a7a]">
          <div className={`${BLOCK_CLASS} h-8 w-24 rounded-full`} />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className={`${BLOCK_CLASS} h-9 w-56`} />
              <div className={`${BLOCK_CLASS} h-4 w-80 max-w-full`} />
            </div>
            <div className={`${BLOCK_CLASS} h-9 w-32 rounded-xl`} />
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-[#d5daf7] bg-white dark:border-[#333a7a] dark:bg-[#1e2250]">
          <div className="flex items-center justify-between border-b border-[#d5daf7] p-5 dark:border-[#333a7a]">
            <div className={`${BLOCK_CLASS} h-5 w-28`} />
            <div className={`${BLOCK_CLASS} h-6 w-20 rounded-full`} />
          </div>
          <div className="divide-y divide-[#d5daf7] dark:divide-[#333a7a]">
            {Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <div className={`${BLOCK_CLASS} size-9 shrink-0 rounded-xl`} />
                <div className={`${BLOCK_CLASS} h-4 w-40`} />
                <div className={`${BLOCK_CLASS} hidden h-4 flex-1 sm:block`} />
                <div className={`${BLOCK_CLASS} h-4 w-16`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}