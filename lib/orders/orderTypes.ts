/** An amount in the smallest currency unit (for example cents) plus its currency code. */
export interface Money {
  amountMinor: number;
  currency: string;
}

export interface ShippingAddress {
  fullName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateOrProvince: string | null;
  postalCode: string | null;
  countryCode: string | null;
}

export interface OrderItem {
  ebayLineItemId: string;
  ebayItemId: string | null;
  title: string;
  sku: string | null;
  quantity: number;
  /** Line price as reported by eBay. Verify against a real order whether it includes quantity. */
  lineItemCost: Money;
  itemUrl: string | null;
}

export interface OrderTotals {
  subtotal: Money | null;
  shipping: Money | null;
  tax: Money | null;
  discount: Money | null;
  total: Money;
  ebayFees: Money | null;
}

/** Fields that come from eBay and are overwritten on every sync. */
export interface OrderRecord {
  ebayOrderId: string;
  ebayEnvironment: "sandbox" | "production";
  fulfillmentStatus: string;
  paymentStatus: string;
  placedAt: Date;
  ebayLastModifiedAt: Date;
  buyerUsername: string | null;
  shippingAddress: ShippingAddress | null;
  items: OrderItem[];
  totals: OrderTotals;
  rawPayload: Record<string, unknown>;
}

/** Fields entered by the owner. A sync must never overwrite these. null means "not entered yet". */
export interface OrderCosts {
  itemCostMinor: number | null;
  shippingCostMinor: number | null;
  otherCostsMinor: number | null;
  notes: string;
}

export type OrderDocument = OrderRecord & OrderCosts;