import "server-only";
import { OrderModel } from "@/lib/orders/orderModel";
import type { OrderRecord } from "@/lib/orders/orderTypes";
import { SyncStateModel } from "@/lib/orders/syncStateModel";
import { getEbayAccessToken } from "./ebayAuth";
import { getEbayConfig } from "./ebayConfig";
import {
  EBAY_SYNC_STATE_KEY_PREFIX,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
  SYNC_OVERLAP_MINUTES,
} from "./ebayConstants";
import { fetchEbayOrdersModifiedSince } from "./fetchEbayOrders";
import { mapEbayOrder } from "./mapEbayOrder";

export interface SyncFailure {
  ebayOrderId: string;
  reason: string;
}

export interface SyncResult {
  readFrom: string;
  fetched: number;
  saved: number;
  failures: SyncFailure[];
}

/** First run reads back a fixed number of days; later runs resume from the last success. */
async function resolveSyncStart(stateKey: string): Promise<Date> {
  const state = await SyncStateModel.findOne({ key: stateKey }).lean();
  if (state) {
    return new Date(state.lastSuccessfulSyncAt.getTime() - SYNC_OVERLAP_MINUTES * MILLISECONDS_PER_MINUTE);
  }
  const { syncLookbackDays } = getEbayConfig();
  return new Date(Date.now() - syncLookbackDays * MILLISECONDS_PER_DAY);
}

/**
 * Pulls new and changed eBay orders into MongoDB.
 * Saving is an upsert by eBay order ID, so repeated runs never create duplicates.
 * Only eBay-derived fields are written; costs the owner entered are never overwritten.
 * The sync position advances only when every order was mapped successfully.
 * The caller must open the database connection first.
 */
export async function syncEbayOrders(): Promise<SyncResult> {
  const { environment } = getEbayConfig();
  const stateKey = `${EBAY_SYNC_STATE_KEY_PREFIX}:${environment}`;

  const startedAt = new Date();
  const readFrom = await resolveSyncStart(stateKey);

  const accessToken = await getEbayAccessToken();
  const ebayOrders = await fetchEbayOrdersModifiedSince(accessToken, readFrom);

  const records: OrderRecord[] = [];
  const failures: SyncFailure[] = [];
  for (const ebayOrder of ebayOrders) {
    try {
      records.push(mapEbayOrder(ebayOrder, environment));
    } catch (error) {
      failures.push({
        ebayOrderId: ebayOrder.orderId,
        reason: error instanceof Error ? error.message : "Unknown mapping error",
      });
    }
  }

  if (records.length > 0) {
    await OrderModel.bulkWrite(
      records.map((record) => ({
        updateOne: {
          filter: { ebayOrderId: record.ebayOrderId },
          update: {
            $set: record,
            $setOnInsert: {
              itemCostMinor: null,
              shippingCostMinor: null,
              otherCostsMinor: null,
              notes: "",
            },
          },
          upsert: true,
        },
      })),
    );
  }

  if (failures.length === 0) {
    await SyncStateModel.updateOne(
      { key: stateKey },
      { $set: { lastSuccessfulSyncAt: startedAt } },
      { upsert: true },
    );
  }

  return {
    readFrom: readFrom.toISOString(),
    fetched: ebayOrders.length,
    saved: records.length,
    failures,
  };
}