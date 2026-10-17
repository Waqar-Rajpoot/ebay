import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { getUploadLimits } from "@/lib/config";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { suggestKeyColumn } from "@/lib/excel/headerMatching";
import { readOrdersWorkbook } from "@/lib/excel/readOrdersWorkbook";
import { readSheetUpload } from "@/lib/http/readSheetUpload";
import { PREVIEW_ROW_COUNT } from "@/lib/orders/orderConstants";
import type { SheetPreview } from "@/lib/orders/orderTypes";

export const runtime = "nodejs";

/** Reads an uploaded sheet and returns its headers and first rows, without saving anything. */
export const POST = withErrorHandling(async (request: Request) => {
  await requireRole("admin");
  const { fileName, buffer } = await readSheetUpload(request);
  const sheet = await readOrdersWorkbook(buffer, getUploadLimits());

  const preview: SheetPreview = {
    fileName,
    sheetName: sheet.sheetName,
    headers: sheet.headers,
    previewRows: sheet.rows.slice(0, PREVIEW_ROW_COUNT).map((row) => row.values),
    totalRows: sheet.rows.length,
    suggestedKeyColumn: suggestKeyColumn(sheet.headers),
    warnings: sheet.warnings,
  };
  return NextResponse.json(preview);
});