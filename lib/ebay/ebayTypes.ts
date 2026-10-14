/** Only the parts of the eBay Sell Fulfillment API response that we read. */

export interface EbayAmount {
  value: string;
  currency: string;
}

export interface EbayLineItem {
  lineItemId: string;
  legacyItemId?: string;
  sku?: string;
  title: string;
  quantity: number;
  lineItemCost: EbayAmount;
}

export interface EbayShipTo {
  fullName?: string;
  primaryPhone?: { phoneNumber?: string };
  contactAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
    countryCode?: string;
  };
}

export interface EbayPricingSummary {
  priceSubtotal?: EbayAmount;
  deliveryCost?: EbayAmount;
  tax?: EbayAmount;
  priceDiscount?: EbayAmount;
  total?: EbayAmount;
}

export interface EbayOrder {
  orderId: string;
  creationDate: string;
  lastModifiedDate: string;
  orderFulfillmentStatus: string;
  orderPaymentStatus: string;
  buyer?: { username?: string };
  pricingSummary?: EbayPricingSummary;
  totalMarketplaceFee?: EbayAmount;
  fulfillmentStartInstructions?: Array<{ shippingStep?: { shipTo?: EbayShipTo } }>;
  lineItems: EbayLineItem[];
}

export interface EbayOrdersPage {
  orders?: EbayOrder[];
  total?: number;
}