import { MAX_HEADER_LENGTH, ROW_NUMBER_KEY } from "@/lib/orders/orderConstants";

/** Normalized header names that usually hold a unique order ID, best match first. */
const KEY_COLUMN_ALIASES = [
  "orderid",
  "ordernumber",
  "ordernum",
  "orderno",
  "salesrecordnumber",
  "salesrecordno",
  "orderreference",
  "orderref",
  "id",
];

/** Lowercase letters and digits only, so "Order ID", "order_id" and "ORDER-ID" compare equal. */
export function normalizeHeaderText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Spreadsheet-style column letter for a zero-based index (0 -> A, 26 -> AA). */
export function columnLetter(zeroBasedIndex: number): string {
  let index = zeroBasedIndex;
  let letters = "";
  do {
    letters = String.fromCharCode(65 + (index % 26)) + letters;
    index = Math.floor(index / 26) - 1;
  } while (index >= 0);
  return letters;
}

export interface HeaderResult {
  headers: string[];
  warnings: string[];
}

/** Gives empty headers a name ("Column F") and makes repeated headers unique ("Name (2)"). */
export function buildUniqueHeaders(rawHeaders: ReadonlyArray<string | number | boolean | null>): HeaderResult {
  const used = new Set<string>();
  let emptyCount = 0;
  let renamedCount = 0;

  const headers = rawHeaders.map((raw, index) => {
    let text = raw === null ? "" : String(raw).trim().slice(0, MAX_HEADER_LENGTH);
    if (text === "") {
      text = `Column ${columnLetter(index)}`;
      emptyCount += 1;
    }
    let candidate = text;
    let suffix = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${text} (${suffix})`;
      suffix += 1;
    }
    if (candidate !== text) renamedCount += 1;
    used.add(candidate.toLowerCase());
    return candidate;
  });

  const warnings: string[] = [];
  if (emptyCount > 0) warnings.push(`${emptyCount} empty header(s) were named by their column letter.`);
  if (renamedCount > 0) warnings.push(`${renamedCount} repeated header(s) were renamed, for example "Name (2)".`);
  return { headers, warnings };
}

/** Best guess for the order ID column, or the row number when no header looks right. */
export function suggestKeyColumn(headers: readonly string[]): string {
  for (const alias of KEY_COLUMN_ALIASES) {
    const match = headers.find((header) => normalizeHeaderText(header) === alias);
    if (match !== undefined) return match;
  }
  return ROW_NUMBER_KEY;
}