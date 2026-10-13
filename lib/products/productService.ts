import { connectToDatabase } from "@/lib/db/connect";
import { ProductModel } from "@/lib/products/productModel";
import type { ProductInput, ProductRecord } from "@/lib/products/productTypes";

/** Saves a validated product and returns it as a plain, serializable record. */
export async function createProduct(input: ProductInput): Promise<ProductRecord> {
  await connectToDatabase();
  const savedProduct = await ProductModel.create(input);

  return {
    id: savedProduct._id.toString(),
    imageName: savedProduct.imageName,
    imageUrl: savedProduct.imageUrl,
    imageFileId: savedProduct.imageFileId,
    title: savedProduct.title,
    description: savedProduct.description,
    category: savedProduct.category,
    condition: savedProduct.condition,
    currency: savedProduct.currency,
    priceInCents: savedProduct.priceInCents,
    shippingCostInCents: savedProduct.shippingCostInCents,
    quantity: savedProduct.quantity,
    createdAt: savedProduct.createdAt.toISOString(),
  };
}