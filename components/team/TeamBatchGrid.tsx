import { notFound } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { ROUTES } from "@/lib/constants";
import { findBatchDetails, listRowDtos } from "@/lib/orders/batchQueries";
import OrdersEditableGrid from "./OrdersEditableGrid";

/** Loads one sheet and its rows for the team grid. */
export default async function TeamBatchGrid({ batchId }: { batchId: string }) {
  const batch = await findBatchDetails(batchId);
  if (!batch) notFound();
  const rows = await listRowDtos(batchId);

  return (
    <main className="mx-auto max-w-[96rem] space-y-6 px-6 py-10">
      <PageHeader
        title={batch.name}
        description={`${batch.rowCount} orders`}
        backHref={ROUTES.team}
        backLabel="All sheets"
      />
      <OrdersEditableGrid batch={batch} initialRows={rows} />
    </main>
  );
}