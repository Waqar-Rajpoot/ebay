import "server-only";
import type { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongoose";
import { objectIdSchema } from "@/lib/validation/schemas";
import { ImportBatchModel, type ImportBatchDocument } from "./importBatchModel";
import { OrderRowModel, type OrderRowDocument } from "./orderRowModel";
import type { BatchDetails, BatchSummary, OrderRowDto } from "./orderTypes";

type LeanBatch = ImportBatchDocument & { _id: Types.ObjectId };
type LeanRow = OrderRowDocument & { _id: Types.ObjectId };

function toBatchSummary(batch: LeanBatch): BatchSummary {
  return {
    id: batch._id.toString(),
    name: batch.name,
    originalFileName: batch.originalFileName,
    rowCount: batch.rowCount,
    createdAt: batch.createdAt.toISOString(),
  };
}

/** Converts a database row into plain data that is safe to send to the browser. */
export function toRowDto(row: LeanRow): OrderRowDto {
  return {
    id: row._id.toString(),
    rowNumber: row.rowNumber,
    rowKey: row.rowKey,
    sourceValues: [...row.sourceValues],
    addedValues: { ...row.addedValues },
    lastEditedBy: row.lastEditedBy,
    lastEditedAt: row.lastEditedAt ? row.lastEditedAt.toISOString() : null,
  };
}

export async function listBatchSummaries(): Promise<BatchSummary[]> {
  await connectToDatabase();
  const batches = await ImportBatchModel.find()
    .sort({ createdAt: -1 })
    .select("name originalFileName rowCount createdAt")
    .lean<LeanBatch[]>();
  return batches.map(toBatchSummary);
}

/** Returns null when the id is malformed or the batch does not exist. */
export async function findBatchDetails(batchId: string): Promise<BatchDetails | null> {
  if (!objectIdSchema.safeParse(batchId).success) return null;
  await connectToDatabase();
  const batch = await ImportBatchModel.findById(batchId).lean<LeanBatch>();
  if (!batch) return null;
  return {
    ...toBatchSummary(batch),
    columns: [...batch.columns],
    keyColumn: batch.keyColumn,
    addedColumns: batch.addedColumns.map((column) => ({
      key: column.key,
      label: column.label,
      type: column.type,
      kind: column.kind,
      formula: column.formula ? { ...column.formula } : null,
    })),
  };
}

export async function listRowDtos(batchId: string): Promise<OrderRowDto[]> {
  if (!objectIdSchema.safeParse(batchId).success) return [];
  await connectToDatabase();
  const rows = await OrderRowModel.find({ batchId }).sort({ rowNumber: 1 }).lean<LeanRow[]>();
  return rows.map(toRowDto);
}