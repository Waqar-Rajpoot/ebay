import { z } from "zod";
import {
  CATEGORY_MAX_LENGTH,
  CENTS_PER_MAJOR_UNIT,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  IMAGE_FILE_ID_PATTERN,
  IMAGE_NAME_MAX_LENGTH,
  MONEY_MAX_MAJOR_UNITS,
  MONEY_PATTERN,
  PRODUCT_CONDITIONS,
  PRODUCT_CURRENCIES,
  QUANTITY_MAX,
  QUANTITY_MIN,
  TITLE_MAX_LENGTH,
  WHOLE_NUMBER_PATTERN,
} from "@/lib/products/productConstants";
import { IMAGE_FILE_ID_MAX_LENGTH, IMAGE_URL_MAX_LENGTH } from "@/lib/images/imageConstants";
import { isHttpsUrl } from "@/lib/images/imageUrl";

const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `Use at most ${maxLength} characters.`);

/** Parses "19.99" into 1999 (integer cents, avoiding floating-point money errors). */
const moneyInCents = z
  .string()
  .trim()
  .regex(MONEY_PATTERN, "Enter a valid amount with at most 2 decimals.")
  .transform((text) => Math.round(Number(text) * CENTS_PER_MAJOR_UNIT))
  .refine((cents) => cents <= MONEY_MAX_MAJOR_UNITS * CENTS_PER_MAJOR_UNIT, `Maximum is ${MONEY_MAX_MAJOR_UNITS}.`);

/**
 * Single source of truth for product validation, shared by the form and the API route.
 * Input: raw form strings. Output: normalized values ready to store.
 */
export const productSchema = z
  .object({
    imageName: requiredText("Image name", IMAGE_NAME_MAX_LENGTH),
    imageUrl: z
      .string()
      .trim()
      .min(1, "Upload an image.")
      .max(IMAGE_URL_MAX_LENGTH, "Image URL is too long.")
      .refine(isHttpsUrl, "Image URL must be a valid https URL."),
    imageFileId: z
      .string()
      .trim()
      .min(1, "Upload an image.")
      .max(IMAGE_FILE_ID_MAX_LENGTH)
      .regex(IMAGE_FILE_ID_PATTERN, "Invalid image reference."),
    title: requiredText("Title", TITLE_MAX_LENGTH),
    description: z
      .string()
      .trim()
      .min(DESCRIPTION_MIN_LENGTH, `Write at least ${DESCRIPTION_MIN_LENGTH} characters.`)
      .max(DESCRIPTION_MAX_LENGTH, `Use at most ${DESCRIPTION_MAX_LENGTH} characters.`),
    category: requiredText("Category", CATEGORY_MAX_LENGTH),
    condition: z.enum(PRODUCT_CONDITIONS),
    currency: z.enum(PRODUCT_CURRENCIES),
    price: moneyInCents.refine((cents) => cents > 0, "Price must be above 0."),
    shippingCost: moneyInCents,
    quantity: z
      .string()
      .trim()
      .regex(WHOLE_NUMBER_PATTERN, "Enter a whole number.")
      .transform(Number)
      .refine(
        (quantity) => quantity >= QUANTITY_MIN && quantity <= QUANTITY_MAX,
        `Enter a number from ${QUANTITY_MIN} to ${QUANTITY_MAX}.`
      ),
  })
  .transform(({ price, shippingCost, ...rest }) => ({
    ...rest,
    priceInCents: price,
    shippingCostInCents: shippingCost,
  }));