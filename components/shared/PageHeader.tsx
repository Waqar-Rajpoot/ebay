import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import SignOutButton from "@/components/access/SignOutButton";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

/** Title row shared by every signed-in page, with an optional back link and action buttons. */
export default function PageHeader({ title, description, backHref, backLabel = "Back", actions }: PageHeaderProps) {
  return (
    <header className="space-y-5 border-b border-[#d5daf7] pb-6 text-[#1e1b4b] dark:border-[#333a7a] dark:text-[#eef0ff]">
      {backHref ? (
        <Link
          href={backHref}
          className="group inline-flex items-center gap-2 rounded-full border border-[#d5daf7] bg-white px-3.5 py-1.5 text-sm font-medium text-[#5b5f8a] transition-all duration-200 hover:border-[#4f46e5] hover:bg-[#e0e3ff] hover:text-[#4f46e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40 motion-reduce:transition-none dark:border-[#333a7a] dark:bg-[#1e2250] dark:text-[#a3a8d6] dark:hover:border-[#818cf8] dark:hover:bg-[#2c3270] dark:hover:text-[#818cf8] dark:focus-visible:ring-[#818cf8]/40"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
          {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="text-base text-[#5b5f8a] dark:text-[#a3a8d6]">{description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}