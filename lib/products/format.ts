import { CENTS_PER_MAJOR_UNIT } from "@/lib/products/productConstants";
import type { ProductCurrency } from "@/lib/products/productTypes";

/** "1999" cents -> "19.99". Locale-free, safe for PDFs. */
export function formatAmount(cents: number): string {
  return (cents / CENTS_PER_MAJOR_UNIT).toFixed(2);
}

/** "1999" cents + "USD" -> "$19.99". For on-screen display. */
export function formatMoney(cents: number, currency: ProductCurrency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / CENTS_PER_MAJOR_UNIT
  );
}