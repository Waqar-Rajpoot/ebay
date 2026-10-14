const MINOR_UNITS_PER_MAJOR_UNIT = 100;
const DECIMAL_PLACES = 2;

/**
 * Converts a decimal string such as "12.34" into whole minor units (1234)
 * without floating-point rounding. Assumes a two-decimal currency.
 *
 * @throws Error if the value is not a valid decimal number.
 */
export function parseMoneyToMinorUnits(value: string): number {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid money amount: "${value}"`);
  }

  const isNegative = trimmed.startsWith("-");
  const [whole, fraction = ""] = trimmed.replace("-", "").split(".");
  const fractionMinor = Number.parseInt(fraction.padEnd(DECIMAL_PLACES, "0").slice(0, DECIMAL_PLACES), 10);
  const minorUnits = Number.parseInt(whole, 10) * MINOR_UNITS_PER_MAJOR_UNIT + fractionMinor;

  return isNegative ? -minorUnits : minorUnits;
}