import type { Metadata } from "next";
import EbayDeclinedView from "@/components/ebay/EbayDeclinedView";

export const metadata: Metadata = { title: "eBay access declined", robots: { index: false } };

export default function EbayDeclinedPage() {
  return <EbayDeclinedView />;
}