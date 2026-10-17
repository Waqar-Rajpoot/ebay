import type { AddedCellValue, ColumnDefinition } from "./orderTypes";

/**
 * Computes a calculated column for one row from the typed values.
 * Returns null while either input is still empty, so the page never shows a made-up number.
 * Only a fixed list of safe operations exists; no user code is ever run.
 */
export function calculateColumnValue(
  column: ColumnDefinition,
  values: Record<string, AddedCellValue>,
): number | null {
  const { formula } = column;
  if (column.kind !== "calculated" || formula === null) return null;

  const left = values[formula.leftKey];
  const right = values[formula.rightKey];
  if (typeof left !== "number" || typeof right !== "number") return null;

  const result = formula.operation === "add" ? left + right : left - right;
  return formula.floorAtZero ? Math.max(0, result) : result;
}

/** Plain-language description shown in the column list. */
export function describeColumn(column: ColumnDefinition, allColumns: readonly ColumnDefinition[]): string {
  if (column.kind === "input") {
    const typeLabel = { money: "amount", number: "number", text: "text" }[column.type];
    return `Typed by the team (${typeLabel})`;
  }
  const { formula } = column;
  if (formula === null) return "Calculated";
  const labelFor = (key: string) => allColumns.find((candidate) => candidate.key === key)?.label ?? key;
  const symbol = formula.operation === "add" ? "+" : "-";
  const floorNote = formula.floorAtZero ? " (never below 0)" : "";
  return `${labelFor(formula.leftKey)} ${symbol} ${labelFor(formula.rightKey)}${floorNote}`;
}