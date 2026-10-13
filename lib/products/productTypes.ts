import type { z } from "zod";
import type { productSchema } from "@/lib/products/productSchema";

/** Raw form values (all strings), as typed by the user. */
export type ProductFormInput = z.input<typeof productSchema>;

/** Validated, normalized product data ready to be stored. */
export type ProductInput = z.output<typeof productSchema>;

export type ProductFieldName = keyof ProductFormInput;

export type ProductCondition = ProductInput["condition"];
export type ProductCurrency = ProductInput["currency"];

export type FieldErrors = Partial<Record<ProductFieldName, string>>;

/** A stored product as returned to clients. */
export interface ProductRecord extends ProductInput {
  id: string;
  createdAt: string;
}