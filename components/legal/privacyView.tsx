import { PRIVACY_CONTACT_EMAIL, PRIVACY_LAST_UPDATED } from "@/lib/legal/legalConstants";

/** Public privacy policy page. Required by eBay when creating a RuName. */
export default function PrivacyView() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: {PRIVACY_LAST_UPDATED}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">What this site does</h2>
        <p>
          This site is a private tool used by the site owner to manage their own eBay sales. With the
          owner&apos;s permission, it reads orders from the owner&apos;s eBay seller account and saves
          them in a private database.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Information we store</h2>
        <p>
          For each order: the order number, items and prices, order status, the buyer&apos;s eBay
          username, and the shipping name, address and phone number that eBay provides to fulfil the
          order.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">How the information is used</h2>
        <p>
          It is used only to keep order records, prepare shipments, and calculate the owner&apos;s costs
          and profit. It is not sold, rented or shared with third parties, and it is not used for
          advertising.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Who can see it</h2>
        <p>Only the site owner, through a protected sign-in. The data is not publicly accessible.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Retention and deletion</h2>
        <p>
          Order records are kept for as long as needed for business and accounting purposes. If you are
          a buyer and want your information removed, contact us and we will delete it where we are able
          to.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Contact</h2>
        <p>
          Questions or deletion requests:{" "}
          <a className="underline" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
            {PRIVACY_CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </main>
  );
}