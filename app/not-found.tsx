import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, FileSpreadsheet, Home, Users } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
};

const SHORTCUTS = [
  { label: "Admin", href: ROUTES.admin, Icon: FileSpreadsheet },
  { label: "Team", href: ROUTES.team, Icon: Users },
] as const;

/** Shown when a URL matches no route, or when a page calls notFound(). */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1ff] px-6 py-16 text-[#1e1b4b] dark:bg-[#14173a] dark:text-[#eef0ff]">
      {/* Entrance and floating animations, disabled for reduced motion. */}
      <style>{`
        @keyframes not-found-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes not-found-float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        .not-found-rise { opacity: 0; animation: not-found-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .not-found-float { animation: not-found-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .not-found-rise { animation: none; opacity: 1; }
          .not-found-float { animation: none; }
        }
      `}</style>

      <section className="w-full max-w-lg space-y-8 text-center">
        <div className="not-found-rise relative mx-auto flex w-fit items-center justify-center">
          <span
            aria-hidden="true"
            className="select-none text-[8rem] font-black leading-none tracking-tighter text-[#e0e3ff] sm:text-[11rem] dark:text-[#2c3270]"
          >
            404
          </span>
          <span className="not-found-float absolute flex size-20 items-center justify-center rounded-2xl bg-[#4f46e5] text-white shadow-lg sm:size-24 dark:bg-[#818cf8] dark:text-[#14173a]">
            <Compass className="size-10 sm:size-12" aria-hidden="true" />
          </span>
        </div>

        <div className="not-found-rise space-y-3" style={{ animationDelay: "120ms" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0d9488] dark:text-[#2dd4bf]">
            Error 404
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
          <p className="mx-auto max-w-sm text-base text-[#5b5f8a] dark:text-[#a3a8d6]">
            The page you are looking for does not exist, was moved, or the link is incorrect.
          </p>
        </div>

        <div
          className="not-found-rise flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "220ms" }}
        >
          <Link
            href={ROUTES.home}
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#4f46e5] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338ca] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:bg-[#818cf8] dark:text-[#14173a] dark:hover:bg-[#a5b4fc] dark:focus-visible:ring-[#818cf8]/40"
          >
            <Home className="size-4" aria-hidden="true" />
            Back to home
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>

          {SHORTCUTS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d5daf7] bg-white px-5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4f46e5] hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}