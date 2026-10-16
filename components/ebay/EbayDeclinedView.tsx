/** Landing page when the seller declines access on eBay (the RuName "Auth Declined URL"). */
export default function EbayDeclinedView() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12 space-y-4">
      <h1 className="text-2xl font-semibold">eBay access was not approved</h1>
      <p>No access was granted and no data was read. You can close this page, or repeat the approval step.</p>
    </main>
  );
}