import { model, models, Schema, type Model } from "mongoose";
import type { Money, OrderDocument, OrderItem, OrderTotals, ShippingAddress } from "./orderTypes";

const moneySchema = new Schema<Money>(
  { amountMinor: { type: Number, required: true }, currency: { type: String, required: true } },
  { _id: false },
);

const shippingAddressSchema = new Schema<ShippingAddress>(
  {
    fullName: { type: String, default: null },
    phone: { type: String, default: null },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
    city: { type: String, default: null },
    stateOrProvince: { type: String, default: null },
    postalCode: { type: String, default: null },
    countryCode: { type: String, default: null },
  },
  { _id: false },
);

const orderItemSchema = new Schema<OrderItem>(
  {
    ebayLineItemId: { type: String, required: true },
    ebayItemId: { type: String, default: null },
    title: { type: String, required: true },
    sku: { type: String, default: null },
    quantity: { type: Number, required: true },
    lineItemCost: { type: moneySchema, required: true },
    itemUrl: { type: String, default: null },
  },
  { _id: false },
);

const orderTotalsSchema = new Schema<OrderTotals>(
  {
    subtotal: { type: moneySchema, default: null },
    shipping: { type: moneySchema, default: null },
    tax: { type: moneySchema, default: null },
    discount: { type: moneySchema, default: null },
    total: { type: moneySchema, required: true },
    ebayFees: { type: moneySchema, default: null },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    ebayOrderId: { type: String, required: true, unique: true },
    ebayEnvironment: { type: String, enum: ["sandbox", "production"], required: true },
    fulfillmentStatus: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    placedAt: { type: Date, required: true },
    ebayLastModifiedAt: { type: Date, required: true },
    buyerUsername: { type: String, default: null },
    shippingAddress: { type: shippingAddressSchema, default: null },
    items: { type: [orderItemSchema], default: [] },
    totals: { type: orderTotalsSchema, required: true },
    rawPayload: { type: Schema.Types.Mixed, required: true },
    itemCostMinor: { type: Number, default: null },
    shippingCostMinor: { type: Number, default: null },
    otherCostsMinor: { type: Number, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

orderSchema.index({ placedAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, placedAt: -1 });

/** Mongoose model for synced eBay orders. Reuses the compiled model during hot reloads. */
export const OrderModel: Model<OrderDocument> =
  (models.Order as Model<OrderDocument> | undefined) ?? model<OrderDocument>("Order", orderSchema);