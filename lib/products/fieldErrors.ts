import type { FieldErrors, ProductFieldName } from "@/lib/products/productTypes";

/** Keeps the first validation message per field, in the shape the form expects. */
export function toFieldErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>
): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const fieldName = String(issue.path[0]) as ProductFieldName;
    if (!errors[fieldName]) errors[fieldName] = issue.message;
  }
  return errors;
}