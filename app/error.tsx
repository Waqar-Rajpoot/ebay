"use client";

import Link from "next/link";
import { ArrowRight, Home, RotateCcw, TriangleAlert } from "lucide-react";
import { ROUTES } from "@/lib/constants";

/** Shown when a page throws while rendering. "Try again" re-renders the failed segment. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1ff] px-6 py-16 text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Entrance and floating animations, disabled for reduced motion. */}
      <style>{`
        @keyframes error-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes error-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .error-rise { opacity: 0; animation: error-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .error-float { animation: error-float 3.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .error-rise { animation: none; opacity: 1; }
          .error-float { animation: none; }
        }
      `}</style>

      <section
        role="alert"
        className="error-rise w-full max-w-md space-y-7 rounded-2xl border border-[#d5daf7] bg-white p-8 text-center dark:border-[#333a7a] dark:bg-[#1e2250]"
      >
        <span className="error-float mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#fde8e8] text-[#c62828] dark:bg-[#4a2230] dark:text-[#ff8a80]">
          <TriangleAlert className="size-8" aria-hidden="true" />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-[#5b5f8a] dark:text-[#a3a8d6]">
            The page could not be loaded. Please try again.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#4f46e5] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 active:translate-y-0 motion-reduce:transition-none dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc] dark:focus-visible:ring-[#818cf8]/40"
          >
            <RotateCcw
              className="size-4 transition-transform duration-500 group-hover:-rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
            Try again
          </button>

          <Link
            href={ROUTES.home}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-[#d5daf7] bg-white px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4f46e5] hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40"
          >
            <Home className="size-4" aria-hidden="true" />
            Home
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}