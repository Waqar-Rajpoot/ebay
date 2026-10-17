import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { removeColumn } from "@/lib/orders/batchService";
import { columnKeySchema, objectIdSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface ColumnRouteContext {
  params: Promise<{ batchId: string; columnKey: string }>;
}

export const DELETE = withErrorHandling<ColumnRouteContext>(async (_request, { params }) => {
  await requireRole("admin");
  const resolved = await params;
  await removeColumn(objectIdSchema.parse(resolved.batchId), columnKeySchema.parse(resolved.columnKey));
  return NextResponse.json({ ok: true });
});