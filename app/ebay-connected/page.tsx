import type { Metadata } from "next";
import EbayConnectedView from "@/components/ebay/EbayConnectedView";

export const metadata: Metadata = { title: "eBay connected", robots: { index: false } };

interface EbayConnectedPageProps {
  searchParams: Promise<{ code?: string | string[] }>;
}

export default async function EbayConnectedPage({ searchParams }: EbayConnectedPageProps) {
  const { code } = await searchParams;
  const authorizationCode = typeof code === "string" ? code : null;

  return <EbayConnectedView authorizationCode={authorizationCode} />;
}