import { describe, expect, it } from "vitest";
import { calculateColumnValue } from "./calculatedColumns";
import { DEFAULT_ADDED_COLUMNS } from "./columnDefinitions";

const profit = DEFAULT_ADDED_COLUMNS.find((column) => column.key === "profit")!;
const loss = DEFAULT_ADDED_COLUMNS.find((column) => column.key === "loss")!;

describe("calculateColumnValue", () => {
  it("returns profit when selling is above buying", () => {
    const values = { buyingPrice: 400, sellingPrice: 950 };
    expect(calculateColumnValue(profit, values)).toBe(550);
    expect(calculateColumnValue(loss, values)).toBe(0);
  });

  it("returns loss when selling is below buying", () => {
    const values = { buyingPrice: 1200, sellingPrice: 1000 };
    expect(calculateColumnValue(profit, values)).toBe(0);
    expect(calculateColumnValue(loss, values)).toBe(200);
  });

  it("stays empty until both prices are typed", () => {
    expect(calculateColumnValue(profit, { buyingPrice: 400, sellingPrice: null })).toBeNull();
    expect(calculateColumnValue(profit, {})).toBeNull();
  });
});