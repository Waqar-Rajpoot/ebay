import { getAddedValue, isRowComplete } from "./orderMetrics";
import type { ColumnDefinition, OrderRowDto } from "./orderTypes";

export type Completeness = "all" | "incomplete" | "complete";

export interface OrderRowFilters {
  searchText: string;
  completeness: Completeness;
}

export const DEFAULT_ROW_FILTERS: OrderRowFilters = { searchText: "", completeness: "all" };

export const COMPLETENESS_OPTIONS: ReadonlyArray<{ value: Completeness; label: string }> = [
  { value: "all", label: "All rows" },
  { value: "incomplete", label: "Missing prices" },
  { value: "complete", label: "Fully filled in" },
];

function rowMatchesSearch(row: OrderRowDto, columns: readonly ColumnDefinition[], needle: string): boolean {
  const inSource = row.sourceValues.some((value) => value !== null && String(value).toLowerCase().includes(needle));
  if (inSource) return true;
  return columns.some((column) => {
    const value = getAddedValue(row, column.key);
    return column.type === "text" && typeof value === "string" && value.toLowerCase().includes(needle);
  });
}

/** Applies the search text and completeness filter. Pure, so it can be tested without the UI. */
export function filterOrderRows(
  rows: readonly OrderRowDto[],
  filters: OrderRowFilters,
  columns: readonly ColumnDefinition[],
): OrderRowDto[] {
  const needle = filters.searchText.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle && !rowMatchesSearch(row, columns, needle)) return false;
    if (filters.completeness === "complete") return isRowComplete(row, columns);
    if (filters.completeness === "incomplete") return !isRowComplete(row, columns);
    return true;
  });
}