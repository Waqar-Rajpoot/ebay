interface EbayConnectedViewProps {
  /** One-time code that eBay adds to the redirect URL; null if the page was opened directly. */
  authorizationCode: string | null;
}

/** Landing page after the seller approves access on eBay (the RuName "Auth Accepted URL"). */
export default function EbayConnectedView({ authorizationCode }: EbayConnectedViewProps) {
  return (
    <main className="mx-auto max-w-xl px-6 py-12 space-y-4">
      <h1 className="text-2xl font-semibold">eBay access approved</h1>

      {authorizationCode ? (
        <>
          <p>
            Copy this one-time code and use it right away with the token script. It expires within a few
            minutes and is useless without your app secret.
          </p>
          <code className="block select-all break-all rounded-md border p-3 text-sm">
            {authorizationCode}
          </code>
        </>
      ) : (
        <p>You can close this page. If you were expecting a code, repeat the eBay approval step.</p>
      )}
    </main>
  );
}