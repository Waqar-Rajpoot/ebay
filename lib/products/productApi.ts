import { apiClient } from "@/lib/api/apiClient";
import type { ProductFormInput, ProductRecord } from "@/lib/products/productTypes";

/** Sends raw form values; the server re-validates them with the same schema. */
export async function createProductRequest(values: ProductFormInput): Promise<ProductRecord> {
  const response = await apiClient.post<{ product: ProductRecord }>("/products", values);
  return response.data.product;
}