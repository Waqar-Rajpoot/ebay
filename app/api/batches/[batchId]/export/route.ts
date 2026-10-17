import { requireRole } from "@/lib/access/accessSession";
import { NotFoundError } from "@/lib/errors/appErrors";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { buildOrdersWorkbook } from "@/lib/excel/buildOrdersWorkbook";
import { findBatchDetails, listRowDtos } from "@/lib/orders/batchQueries";
import { EXCEL_FILE_EXTENSION, EXCEL_MIME_TYPE } from "@/lib/orders/orderConstants";
import { objectIdSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface ExportRouteContext {
  params: Promise<{ batchId: string }>;
}

function toSafeFileName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9 _-]/g, "_").trim();
  return cleaned === "" ? "orders" : cleaned;
}

/** Downloads the batch as an .xlsx file with the team's values and live formulas. */
export const GET = withErrorHandling<ExportRouteContext>(async (_request, { params }) => {
  await requireRole("admin");
  const batchId = objectIdSchema.parse((await params).batchId);

  const batch = await findBatchDetails(batchId);
  if (!batch) throw new NotFoundError("This sheet no longer exists.");
  const rows = await listRowDtos(batchId);

  const workbookBuffer = await buildOrdersWorkbook(batch, rows);
  return new Response(new Uint8Array(workbookBuffer), {
    headers: {
      "Content-Type": EXCEL_MIME_TYPE,
      "Content-Disposition": `attachment; filename="${toSafeFileName(batch.name)}-updated${EXCEL_FILE_EXTENSION}"`,
      "Cache-Control": "no-store",
    },
  });
});