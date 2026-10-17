import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileSpreadsheet,
  Pencil,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/lib/constants";
import styles from "./HomeView.module.css";

interface EntryCard {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  Icon: LucideIcon;
  highlights: { label: string; Icon: LucideIcon }[];
  themeClassName: string;
}

const ENTRY_CARDS: EntryCard[] = [
  {
    title: "Admin",
    description: "Upload sheets, manage columns, download the updated Excel.",
    href: ROUTES.admin,
    actionLabel: "Open admin",
    Icon: FileSpreadsheet,
    highlights: [
      { label: "Upload", Icon: Upload },
      { label: "Export", Icon: Download },
    ],
    themeClassName: styles.admin,
  },
  {
    title: "Team",
    description: "Open an order sheet and fill in buying and selling prices.",
    href: ROUTES.team,
    actionLabel: "Open team page",
    Icon: Users,
    highlights: [{ label: "Edit prices", Icon: Pencil }],
    themeClassName: styles.team,
  },
];

/** Landing page with one entry point for each area. */
export default function HomeView() {
  return (
    <main className={`${styles.page} flex min-h-screen items-center justify-center px-6 py-16`}>
      <div className="w-full max-w-4xl space-y-12">
        <header className={`${styles.fadeUp} space-y-5 text-center`}>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{ border: "1px solid var(--home-border)", color: "var(--home-muted)" }}
          >
            <span
              className={`${styles.badgeDot} size-2 rounded-full`}
              style={{ backgroundColor: "var(--home-team)" }}
              aria-hidden="true"
            />
            Order sheet workspace
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{APP_NAME}</h1>
          <p className="mx-auto max-w-xl text-base sm:text-lg" style={{ color: "var(--home-muted)" }}>
            {APP_DESCRIPTION}
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {ENTRY_CARDS.map(({ title, description, href, actionLabel, Icon, highlights, themeClassName }, index) => (
            <Link
              key={title}
              href={href}
              className={`${styles.fadeUp} ${styles.card} ${themeClassName} group relative flex flex-col gap-6 overflow-hidden rounded-2xl p-7 focus-visible:outline-none`}
              style={{ animationDelay: `${150 + index * 120}ms` }}
            >
              <span aria-hidden="true" className={`${styles.bar} absolute inset-x-0 top-0 h-1`} />

              <div className={`${styles.iconBox} flex size-14 items-center justify-center rounded-xl`}>
                <Icon className="size-7" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--home-muted)" }}>
                  {description}
                </p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {highlights.map(({ label, Icon: HighlightIcon }) => (
                  <li
                    key={label}
                    className={`${styles.chip} inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium`}
                  >
                    <HighlightIcon className="size-3.5" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>

              <span className={`${styles.action} mt-auto inline-flex items-center gap-2 text-sm font-semibold`}>
                {actionLabel}
                <ArrowRight className={`${styles.arrow} size-4`} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}