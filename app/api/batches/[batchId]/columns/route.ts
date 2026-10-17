import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { readJsonBody } from "@/lib/http/readJsonBody";
import { addColumn } from "@/lib/orders/batchService";
import { createColumnSchema, objectIdSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface ColumnsRouteContext {
  params: Promise<{ batchId: string }>;
}

export const POST = withErrorHandling<ColumnsRouteContext>(async (request, { params }) => {
  await requireRole("admin");
  const batchId = objectIdSchema.parse((await params).batchId);
  const input = createColumnSchema.parse(await readJsonBody(request));
  const column = await addColumn(batchId, input);
  return NextResponse.json(column, { status: 201 });
});