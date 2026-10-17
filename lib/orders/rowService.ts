import "server-only";
import type { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongoose";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors/appErrors";
import type { CellUpdateInput } from "@/lib/validation/schemas";
import { toRowDto } from "./batchQueries";
import { parseCellInput } from "./cellValues";
import { ImportBatchModel, type ImportBatchDocument } from "./importBatchModel";
import { OrderRowModel, type OrderRowDocument } from "./orderRowModel";
import type { OrderRowDto } from "./orderTypes";

type LeanBatch = ImportBatchDocument & { _id: Types.ObjectId };
type LeanRow = OrderRowDocument & { _id: Types.ObjectId };

export async function findRow(rowId: string): Promise<OrderRowDto> {
  await connectToDatabase();
  const row = await OrderRowModel.findById(rowId).lean<LeanRow>();
  if (!row) throw new NotFoundError("This order no longer exists.");
  return toRowDto(row);
}

/**
 * Saves one cell. The write only succeeds if the cell still holds the value the browser last saw,
 * so two people editing the same cell can never silently overwrite each other.
 * Different cells in the same row never conflict.
 */
export async function updateCell(rowId: string, input: CellUpdateInput): Promise<OrderRowDto> {
  await connectToDatabase();
  const row = await OrderRowModel.findById(rowId).select("batchId").lean<LeanRow>();
  if (!row) throw new NotFoundError("This order no longer exists.");

  const batch = await ImportBatchModel.findById(row.batchId).select("addedColumns").lean<LeanBatch>();
  const column = batch?.addedColumns.find((candidate) => candidate.key === input.columnKey);
  if (!column) throw new NotFoundError("That column no longer exists.");
  if (column.kind !== "input") throw new ValidationError("This column is calculated and cannot be edited.");

  const newValue = parseCellInput(column, input.value);
  const path = `addedValues.${column.key}`;

  const updated = await OrderRowModel.findOneAndUpdate(
    // A null expected value also matches a cell that was never filled in.
    { _id: rowId, [path]: input.expectedValue },
    { $set: { [path]: newValue, lastEditedBy: input.editorName, lastEditedAt: new Date() } },
    { new: true },
  ).lean<LeanRow>();

  if (!updated) {
    const current = await OrderRowModel.findById(rowId).lean<LeanRow>();
    if (!current) throw new NotFoundError("This order no longer exists.");
    throw new ConflictError("Someone else changed this cell. Their value is now shown.", {
      currentValue: current.addedValues[column.key] ?? null,
    });
  }
  return toRowDto(updated);
}