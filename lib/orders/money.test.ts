import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors/appErrors";
import { formatMinorUnits, parseMoneyInput } from "./money";

describe("parseMoneyInput", () => {
  it("converts decimal text to whole minor units", () => {
    expect(parseMoneyInput("12.34")).toBe(1234);
    expect(parseMoneyInput("12")).toBe(1200);
    expect(parseMoneyInput("0.5")).toBe(50);
    expect(parseMoneyInput("1,250.10")).toBe(125010);
  });

  it("rejects negatives, extra decimals, and text", () => {
    expect(() => parseMoneyInput("-5")).toThrow(ValidationError);
    expect(() => parseMoneyInput("1.234")).toThrow(ValidationError);
    expect(() => parseMoneyInput("abc")).toThrow(ValidationError);
  });

  it("rejects amounts above the maximum", () => {
    expect(() => parseMoneyInput("999999999999")).toThrow(ValidationError);
  });
});

describe("formatMinorUnits", () => {
  it("formats with two decimals", () => {
    expect(formatMinorUnits(125010)).toBe("1,250.10");
  });
});