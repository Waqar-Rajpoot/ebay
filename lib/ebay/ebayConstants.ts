/** Read-only access to the seller's orders. */
export const EBAY_FULFILLMENT_READONLY_SCOPE =
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly";

/** Public listing page for an eBay item; append the legacy item ID. */
export const EBAY_ITEM_URL_BASE = "https://www.ebay.com/itm/";

/** Orders requested per getOrders call. */
export const EBAY_ORDERS_PAGE_SIZE = 100;

/** Prefix of the key that stores the last successful sync time per environment. */
export const EBAY_SYNC_STATE_KEY_PREFIX = "ebay-orders";

/**
 * Each sync re-reads this far before the last success, so orders modified
 * while a previous run was in progress are never missed. Upserts make it safe.
 */
export const SYNC_OVERLAP_MINUTES = 5;

/** Refresh the access token this long before it actually expires. */
export const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

export const MILLISECONDS_PER_MINUTE = 60_000;
export const MILLISECONDS_PER_DAY = 86_400_000;

/** Max characters of an eBay error body kept in error messages. */
export const ERROR_BODY_PREVIEW_LENGTH = 500;