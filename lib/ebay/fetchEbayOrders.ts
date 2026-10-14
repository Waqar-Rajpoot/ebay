import "server-only";
import { getEbayConfig } from "./ebayConfig";
import { ERROR_BODY_PREVIEW_LENGTH, EBAY_ORDERS_PAGE_SIZE } from "./ebayConstants";
import { EbayApiError } from "./ebayError";
import type { EbayOrder, EbayOrdersPage } from "./ebayTypes";

/**
 * Fetches every order modified at or after the given time, following pagination.
 * Filtering by modification time (not creation time) also picks up status changes.
 *
 * @param accessToken Valid eBay user access token.
 * @param modifiedSince Earliest last-modified time to include.
 * @returns All matching eBay orders.
 * @throws EbayApiError on a non-success response.
 */
export async function fetchEbayOrdersModifiedSince(
  accessToken: string,
  modifiedSince: Date,
): Promise<EbayOrder[]> {
  const { apiBaseUrl } = getEbayConfig();
  const orders: EbayOrder[] = [];
  let offset = 0;

  for (;;) {
    const query = new URLSearchParams({
      filter: `lastmodifieddate:[${modifiedSince.toISOString()}..]`,
      limit: String(EBAY_ORDERS_PAGE_SIZE),
      offset: String(offset),
    });

    const response = await fetch(`${apiBaseUrl}/sell/fulfillment/v1/order?${query}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const bodyPreview = (await response.text()).slice(0, ERROR_BODY_PREVIEW_LENGTH);
      throw new EbayApiError(`eBay getOrders failed: ${bodyPreview}`, response.status);
    }

    const page = (await response.json()) as EbayOrdersPage;
    const pageOrders = page.orders ?? [];
    orders.push(...pageOrders);
    offset += pageOrders.length;

    if (pageOrders.length === 0 || offset >= (page.total ?? 0)) break;
  }

  return orders;
}