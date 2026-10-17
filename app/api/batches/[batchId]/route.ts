import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access/accessSession";
import { withErrorHandling } from "@/lib/errors/errorResponse";
import { deleteBatch } from "@/lib/orders/batchService";
import { objectIdSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

interface BatchRouteContext {
  params: Promise<{ batchId: string }>;
}

export const DELETE = withErrorHandling<BatchRouteContext>(async (_request, { params }) => {
  await requireRole("admin");
  const batchId = objectIdSchema.parse((await params).batchId);
  await deleteBatch(batchId);
  return NextResponse.json({ ok: true });
});