import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { IMAGE_FILE_ID_MAX_LENGTH, IMAGE_URL_MAX_LENGTH } from "@/lib/images/imageConstants";
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  IMAGE_NAME_MAX_LENGTH,
  PRODUCT_CONDITIONS,
  PRODUCT_CURRENCIES,
  QUANTITY_MAX,
  QUANTITY_MIN,
  TITLE_MAX_LENGTH,
} from "@/lib/products/productConstants";

const productSchema = new Schema(
  {
    imageName: { type: String, required: true, trim: true, maxlength: IMAGE_NAME_MAX_LENGTH },
    imageUrl: { type: String, required: true, trim: true, maxlength: IMAGE_URL_MAX_LENGTH },
    imageFileId: { type: String, required: true, trim: true, maxlength: IMAGE_FILE_ID_MAX_LENGTH },
    title: { type: String, required: true, trim: true, maxlength: TITLE_MAX_LENGTH },
    description: { type: String, required: true, trim: true, maxlength: DESCRIPTION_MAX_LENGTH },
    category: { type: String, required: true, trim: true, index: true, maxlength: CATEGORY_MAX_LENGTH },
    condition: { type: String, required: true, enum: PRODUCT_CONDITIONS },
    currency: { type: String, required: true, enum: PRODUCT_CURRENCIES },
    priceInCents: { type: Number, required: true, min: 1 },
    shippingCostInCents: { type: Number, required: true, min: 0, default: 0 },
    quantity: { type: Number, required: true, min: QUANTITY_MIN, max: QUANTITY_MAX },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

/** Reuses the compiled model across hot reloads to avoid OverwriteModelError. */
export const ProductModel: Model<ProductDocument> =
  (mongoose.models.Product as Model<ProductDocument> | undefined) ??
  mongoose.model<ProductDocument>("Product", productSchema);