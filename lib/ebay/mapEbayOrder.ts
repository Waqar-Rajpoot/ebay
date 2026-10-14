import { parseMoneyToMinorUnits } from "@/lib/orders/money";
import type { Money, OrderItem, OrderRecord, ShippingAddress } from "@/lib/orders/orderTypes";
import { EBAY_ITEM_URL_BASE } from "./ebayConstants";
import type { EbayAmount, EbayLineItem, EbayOrder, EbayShipTo } from "./ebayTypes";

function toMoney(amount: EbayAmount): Money {
  return { amountMinor: parseMoneyToMinorUnits(amount.value), currency: amount.currency };
}

function toOptionalMoney(amount: EbayAmount | undefined): Money | null {
  return amount ? toMoney(amount) : null;
}

function mapShippingAddress(shipTo: EbayShipTo | undefined): ShippingAddress | null {
  if (!shipTo) return null;
  const address = shipTo.contactAddress;
  return {
    fullName: shipTo.fullName ?? null,
    phone: shipTo.primaryPhone?.phoneNumber ?? null,
    addressLine1: address?.addressLine1 ?? null,
    addressLine2: address?.addressLine2 ?? null,
    city: address?.city ?? null,
    stateOrProvince: address?.stateOrProvince ?? null,
    postalCode: address?.postalCode ?? null,
    countryCode: address?.countryCode ?? null,
  };
}

function mapLineItem(lineItem: EbayLineItem): OrderItem {
  return {
    ebayLineItemId: lineItem.lineItemId,
    ebayItemId: lineItem.legacyItemId ?? null,
    title: lineItem.title,
    sku: lineItem.sku ?? null,
    quantity: lineItem.quantity,
    lineItemCost: toMoney(lineItem.lineItemCost),
    itemUrl: lineItem.legacyItemId ? `${EBAY_ITEM_URL_BASE}${lineItem.legacyItemId}` : null,
  };
}

/**
 * Converts one eBay order into our order shape. Pure: no I/O, so it is easy to test.
 *
 * @param order Order as returned by the eBay Sell Fulfillment API.
 * @param ebayEnvironment Which eBay environment the order came from.
 * @throws Error if the order has no total or contains an invalid amount.
 */
export function mapEbayOrder(order: EbayOrder, ebayEnvironment: "sandbox" | "production"): OrderRecord {
  const pricing = order.pricingSummary;
  if (!pricing?.total) {
    throw new Error(`Order ${order.orderId} has no total`);
  }

  return {
    ebayOrderId: order.orderId,
    ebayEnvironment,
    fulfillmentStatus: order.orderFulfillmentStatus,
    paymentStatus: order.orderPaymentStatus,
    placedAt: new Date(order.creationDate),
    ebayLastModifiedAt: new Date(order.lastModifiedDate),
    buyerUsername: order.buyer?.username ?? null,
    shippingAddress: mapShippingAddress(order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo),
    items: order.lineItems.map(mapLineItem),
    totals: {
      subtotal: toOptionalMoney(pricing.priceSubtotal),
      shipping: toOptionalMoney(pricing.deliveryCost),
      tax: toOptionalMoney(pricing.tax),
      discount: toOptionalMoney(pricing.priceDiscount),
      total: toMoney(pricing.total),
      ebayFees: toOptionalMoney(order.totalMarketplaceFee),
    },
    rawPayload: { ...order },
  };
}