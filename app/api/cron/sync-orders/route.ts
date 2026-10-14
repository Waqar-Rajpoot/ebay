import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getEbayConfig } from "@/lib/ebay/ebayConfig";
import { syncEbayOrders } from "@/lib/ebay/syncOrders";
// ASSUMPTION: adjust this import to the connect function exported by lib/db/mongoose.ts.
import { connectToDatabase } from "@/lib/db/mongoose";

export const dynamic = "force-dynamic";

/** Constant-time check of the "Authorization: Bearer <CRON_SECRET>" header. */
function isAuthorized(request: Request, cronSecret: string): boolean {
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${cronSecret}`);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/** Called by the scheduler. Returns counts only; never customer data. */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { cronSecret } = getEbayConfig();
    if (!isAuthorized(request, cronSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const result = await syncEbayOrders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("eBay order sync failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}