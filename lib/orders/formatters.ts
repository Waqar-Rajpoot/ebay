import type { SourceCellValue } from "./orderTypes";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Fixed locale and time zone, so server and browser always print the same text. */
export function formatDateTime(isoString: string): string {
  return `${dateTimeFormatter.format(new Date(isoString))} UTC`;
}

export function formatSourceValue(value: SourceCellValue): string {
  return value === null ? "" : String(value);
}