import { describe, expect, it } from "vitest";
import { ROW_NUMBER_KEY } from "@/lib/orders/orderConstants";
import { buildUniqueHeaders, columnLetter, suggestKeyColumn } from "./headerMatching";

describe("buildUniqueHeaders", () => {
  it("names empty headers and renames repeated ones", () => {
    const { headers, warnings } = buildUniqueHeaders(["Name", "Name", null, "Address"]);
    expect(headers).toEqual(["Name", "Name (2)", "Column C", "Address"]);
    expect(warnings).toHaveLength(2);
  });
});

describe("suggestKeyColumn", () => {
  it("matches common order ID headers in any position", () => {
    expect(suggestKeyColumn(["Buyer", "Item", "Order ID"])).toBe("Order ID");
    expect(suggestKeyColumn(["order_number", "Buyer"])).toBe("order_number");
  });

  it("falls back to the row number", () => {
    expect(suggestKeyColumn(["Buyer", "Item"])).toBe(ROW_NUMBER_KEY);
  });
});

describe("columnLetter", () => {
  it("counts like a spreadsheet", () => {
    expect([columnLetter(0), columnLetter(25), columnLetter(26)]).toEqual(["A", "Z", "AA"]);
  });
});