import { ValidationError } from "@/lib/errors/appErrors";
import { formatMinorUnitsPlain, parseMoneyInput } from "./money";
import { MAX_NUMBER_VALUE, MAX_TEXT_VALUE_LENGTH } from "./orderConstants";
import type { AddedCellValue, ColumnDefinition } from "./orderTypes";

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

function parseNumberInput(raw: string): number {
  const cleaned = raw.trim().replace(/[,\s]/g, "");
  if (!NUMBER_PATTERN.test(cleaned)) throw new ValidationError("Enter a number such as 12 or 3.5.");
  const value = Number(cleaned);
  if (!Number.isFinite(value) || Math.abs(value) > MAX_NUMBER_VALUE) {
    throw new ValidationError("That number is too large.");
  }
  return value;
}

/**
 * Turns typed text into the value stored for a column, according to its type.
 * Blank text clears the cell (null).
 * @throws ValidationError when the text does not fit the column type.
 */
export function parseCellInput(column: ColumnDefinition, raw: string | null): AddedCellValue {
  if (raw === null || raw.trim() === "") return null;
  switch (column.type) {
    case "money":
      return parseMoneyInput(raw);
    case "number":
      return parseNumberInput(raw);
    case "text": {
      const text = raw.trim();
      if (text.length > MAX_TEXT_VALUE_LENGTH) {
        throw new ValidationError(`Use at most ${MAX_TEXT_VALUE_LENGTH} characters.`);
      }
      return text;
    }
  }
}

/** Text shown inside an input box for a stored value. */
export function toInputText(column: ColumnDefinition, value: AddedCellValue): string {
  if (value === null) return "";
  if (column.type === "money" && typeof value === "number") return formatMinorUnitsPlain(value);
  return String(value);
}

/** Narrows an unknown value (for example from an error response) to a storable cell value. */
export function toAddedCellValue(value: unknown): AddedCellValue {
  return typeof value === "string" || typeof value === "number" ? value : null;
}