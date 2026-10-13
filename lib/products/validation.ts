import {
  CATEGORY_MAX_LENGTH,
  CENTS_PER_MAJOR_UNIT,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  IMAGE_NAME_MAX_LENGTH,
  MONEY_MAX_MAJOR_UNITS,
  MONEY_PATTERN,
  PRODUCT_CONDITIONS,
  PRODUCT_CURRENCIES,
  QUANTITY_MAX,
  QUANTITY_MIN,
  TITLE_MAX_LENGTH,
} from "@/lib/products/productConstants";
import type {
  FieldErrors,
  ProductCondition,
  ProductCurrency,
  ProductInput,
} from "@/lib/products/productTypes";

export type ValidationResult =
  | { success: true; data: ProductInput }
  | { success: false; errors: FieldErrors };

/** Reads a string or number field as trimmed text; anything else becomes "". */
function readText(value: unknown): string {
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value.trim() : "";
}

function isHttpUrl(text: string): boolean {
  try {
    const { protocol } = new URL(text);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Converts "19.99" to 1999. Returns null when the text is not a valid amount. */
function parseMoneyToCents(text: string): number | null {
  if (!MONEY_PATTERN.test(text)) return null;
  const majorUnits = Number(text);
  if (majorUnits > MONEY_MAX_MAJOR_UNITS) return null;
  return Math.round(majorUnits * CENTS_PER_MAJOR_UNIT);
}

function isOneOf<Allowed extends string>(
  allowedValues: readonly Allowed[],
  value: string
): value is Allowed {
  return (allowedValues as readonly string[]).includes(value);
}

/**
 * Validates and normalizes raw product form data.
 * Pure and dependency-free so the browser and the API route share it.
 */
export function validateProductInput(raw: unknown): ValidationResult {
  const source = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const errors: FieldErrors = {};

  const imageName = readText(source.imageName);
  if (!imageName) errors.imageName = "Image name is required.";
  else if (imageName.length > IMAGE_NAME_MAX_LENGTH)
    errors.imageName = `Use at most ${IMAGE_NAME_MAX_LENGTH} characters.`;

  const imageUrl = readText(source.imageUrl);
  if (!imageUrl) errors.imageUrl = "Image URL is required.";
  else if (!isHttpUrl(imageUrl))
    errors.imageUrl = "Enter a valid http or https URL.";

  const title = readText(source.title);
  if (!title) errors.title = "Title is required.";
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Use at most ${TITLE_MAX_LENGTH} characters.`;

  const description = readText(source.description);
  if (description.length < DESCRIPTION_MIN_LENGTH)
    errors.description = `Write at least ${DESCRIPTION_MIN_LENGTH} characters.`;
  else if (description.length > DESCRIPTION_MAX_LENGTH)
    errors.description = `Use at most ${DESCRIPTION_MAX_LENGTH} characters.`;

  const category = readText(source.category);
  if (!category) errors.category = "Category is required.";
  else if (category.length > CATEGORY_MAX_LENGTH)
    errors.category = `Use at most ${CATEGORY_MAX_LENGTH} characters.`;

  const condition = readText(source.condition);
  if (!isOneOf(PRODUCT_CONDITIONS, condition))
    errors.condition = "Choose a valid condition.";

  const currency = readText(source.currency);
  if (!isOneOf(PRODUCT_CURRENCIES, currency))
    errors.currency = "Choose a valid currency.";

  const priceInCents = parseMoneyToCents(readText(source.price));
  if (priceInCents === null || priceInCents === 0)
    errors.price = "Enter a price above 0 with at most 2 decimals.";

  const shippingText = readText(source.shippingCost) || "0";
  const shippingCostInCents = parseMoneyToCents(shippingText);
  if (shippingCostInCents === null)
    errors.shippingCost = "Enter a valid amount (0 for free shipping).";

  const quantity = Number(readText(source.quantity));
  if (!Number.isInteger(quantity) || quantity < QUANTITY_MIN || quantity > QUANTITY_MAX)
    errors.quantity = `Enter a whole number from ${QUANTITY_MIN} to ${QUANTITY_MAX}.`;

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      imageName,
      imageUrl,
      title,
      description,
      category,
      condition: condition as ProductCondition,
      currency: currency as ProductCurrency,
      priceInCents: priceInCents as number,
      shippingCostInCents: shippingCostInCents as number,
      quantity,
    },
  };
}