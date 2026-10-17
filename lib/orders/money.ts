import { ValidationError } from "@/lib/errors/appErrors";
import { MAX_MONEY_MINOR_UNITS, MINOR_UNITS_PER_MAJOR_UNIT, MONEY_DECIMAL_PLACES } from "./orderConstants";

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: MONEY_DECIMAL_PLACES,
  maximumFractionDigits: MONEY_DECIMAL_PLACES,
});

/**
 * Converts typed text such as "12.34" into whole minor units (1234) without floating-point math.
 * @throws ValidationError for negatives, more than 2 decimals, or very large amounts.
 */
export function parseMoneyInput(raw: string): number {
  const cleaned = raw.trim().replace(/[,\s]/g, "");
  if (!MONEY_PATTERN.test(cleaned)) {
    throw new ValidationError("Enter an amount such as 12 or 12.34 (no negatives, at most 2 decimals).");
  }
  const [whole, fraction = ""] = cleaned.split(".");
  const minorUnits =
    Number(whole) * MINOR_UNITS_PER_MAJOR_UNIT + Number(fraction.padEnd(MONEY_DECIMAL_PLACES, "0"));
  if (!Number.isSafeInteger(minorUnits) || minorUnits > MAX_MONEY_MINOR_UNITS) {
    throw new ValidationError("That amount is too large.");
  }
  return minorUnits;
}

/** "1,234.50" for display. */
export function formatMinorUnits(minorUnits: number): string {
  return moneyFormatter.format(minorUnits / MINOR_UNITS_PER_MAJOR_UNIT);
}

/** "1234.50" for input boxes (no thousands separators). */
export function formatMinorUnitsPlain(minorUnits: number): string {
  return (minorUnits / MINOR_UNITS_PER_MAJOR_UNIT).toFixed(MONEY_DECIMAL_PLACES);
}

/** Decimal amount used when writing numbers into Excel. */
export function minorUnitsToMajor(minorUnits: number): number {
  return minorUnits / MINOR_UNITS_PER_MAJOR_UNIT;
}