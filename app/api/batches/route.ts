import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { getUploadLimits } from "@/lib/config";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { readOrdersWorkbook } from "@/lib/excel/readOrdersWorkbook";
import { readSheetUpload } from "@/lib/http/readSheetUpload";
import { importBatch } from "@/lib/orders/batchService";
import { importMetadataSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

/** Imports an uploaded sheet as a new batch. */
export const POST = withErrorHandling(async (request: Request) => {
  await requireRole("admin");
  const { formData, fileName, buffer } = await readSheetUpload(request);
  const metadata = importMetadataSchema.parse({
    batchName: String(formData.get("batchName") ?? ""),
    keyColumn: String(formData.get("keyColumn") ?? ""),
  });

  const sheet = await readOrdersWorkbook(buffer, getUploadLimits());
  const result = await importBatch({
    batchName: metadata.batchName,
    originalFileName: fileName,
    keyColumn: metadata.keyColumn,
    sheet,
  });
  return NextResponse.json(result, { status: 201 });
});