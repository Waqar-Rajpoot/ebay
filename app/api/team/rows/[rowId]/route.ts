import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { readJsonBody } from "@/lib/http/readJsonBody";
import { findRow, updateCell } from "@/lib/orders/rowService";
import { cellUpdateSchema, objectIdSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface RowRouteContext {
  params: Promise<{ rowId: string }>;
}

export const GET = withErrorHandling<RowRouteContext>(async (_request, { params }) => {
  await requireRole("team");
  const rowId = objectIdSchema.parse((await params).rowId);
  return NextResponse.json(await findRow(rowId));
});

/** Saves one cell typed by the team. */
export const PATCH = withErrorHandling<RowRouteContext>(async (request, { params }) => {
  await requireRole("team");
  const rowId = objectIdSchema.parse((await params).rowId);
  const input = cellUpdateSchema.parse(await readJsonBody(request));
  return NextResponse.json(await updateCell(rowId, input));
});