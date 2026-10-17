import { MAX_COLUMN_KEY_LENGTH } from "./orderConstants";
import type { ColumnDefinition } from "./orderTypes";

export const BUYING_PRICE_KEY = "buyingPrice";
export const SELLING_PRICE_KEY = "sellingPrice";

/** Columns every new batch starts with. */
export const DEFAULT_ADDED_COLUMNS: readonly ColumnDefinition[] = [
  { key: BUYING_PRICE_KEY, label: "Buying price", type: "money", kind: "input", formula: null },
  { key: SELLING_PRICE_KEY, label: "Selling price", type: "money", kind: "input", formula: null },
  {
    key: "profit",
    label: "Profit",
    type: "money",
    kind: "calculated",
    formula: { operation: "subtract", leftKey: SELLING_PRICE_KEY, rightKey: BUYING_PRICE_KEY, floorAtZero: true },
  },
  {
    key: "loss",
    label: "Loss",
    type: "money",
    kind: "calculated",
    formula: { operation: "subtract", leftKey: BUYING_PRICE_KEY, rightKey: SELLING_PRICE_KEY, floorAtZero: true },
  },
];

/** Safe, unique camelCase key made from a column label, for example "Shipping cost" -> "shippingCost". */
export function toColumnKey(label: string, existingKeys: ReadonlySet<string>): string {
  const words = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  let base = words
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("");
  if (!/^[a-z]/.test(base)) base = `col${base}`;
  base = base.slice(0, MAX_COLUMN_KEY_LENGTH - 3);

  let key = base;
  let suffix = 2;
  while (existingKeys.has(key)) {
    key = `${base}${suffix}`;
    suffix += 1;
  }
  return key;
}