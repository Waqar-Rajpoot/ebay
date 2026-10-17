import { calculateColumnValue } from "./calculatedColumns";
import type { AddedCellValue, ColumnDefinition, OrderRowDto } from "./orderTypes";

export function getAddedValue(row: OrderRowDto, key: string): AddedCellValue {
  return row.addedValues[key] ?? null;
}

/** Typed money and number columns must be filled for a row to count as complete. */
export function isRequiredInputColumn(column: ColumnDefinition): boolean {
  return column.kind === "input" && (column.type === "money" || column.type === "number");
}

export function isRowComplete(row: OrderRowDto, columns: readonly ColumnDefinition[]): boolean {
  return columns.filter(isRequiredInputColumn).every((column) => getAddedValue(row, column.key) !== null);
}

/** Total of every money column (typed or calculated) across the given rows, in minor units. */
export function summarizeRows(
  rows: readonly OrderRowDto[],
  columns: readonly ColumnDefinition[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const column of columns) {
    if (column.type !== "money") continue;
    let total = 0;
    for (const row of rows) {
      const value =
        column.kind === "calculated" ? calculateColumnValue(column, row.addedValues) : getAddedValue(row, column.key);
      if (typeof value === "number") total += value;
    }
    totals[column.key] = total;
  }
  return totals;
}