import "server-only";
import type { Types } from "mongoose";
import connectToDatabase from "@/lib/db/mongoose";
import { ConflictError, ImportError, NotFoundError, ValidationError } from "@/lib/errors/appErrors";
import type { CreateColumnInput } from "@/lib/validation/schemas";
import type { ParsedSheet } from "@/lib/excel/readOrdersWorkbook";
import { DEFAULT_ADDED_COLUMNS, toColumnKey } from "./columnDefinitions";
import { ImportBatchModel, type ImportBatchDocument } from "./importBatchModel";
import { OrderRowModel } from "./orderRowModel";
import { MAX_ADDED_COLUMNS, MAX_REPORTED_SKIPPED_ROWS, MAX_ROW_KEY_LENGTH, ROW_NUMBER_KEY } from "./orderConstants";
import type { ColumnDefinition, ImportResult, SkippedRow, SourceCellValue } from "./orderTypes";

type LeanBatch = ImportBatchDocument & { _id: Types.ObjectId };

export interface ImportBatchInput {
  batchName: string;
  originalFileName: string;
  keyColumn: string;
  sheet: ParsedSheet;
}

function toRowKey(value: SourceCellValue | undefined): string {
  return value === null || value === undefined ? "" : String(value).trim();
}

/**
 * Saves a parsed sheet as a new batch. Rows with an empty or repeated order ID are skipped and reported.
 * If saving the rows fails, the batch is removed again so no half-imported sheet is left behind.
 */
export async function importBatch(input: ImportBatchInput): Promise<ImportResult> {
  const { sheet, keyColumn } = input;
  const useRowNumber = keyColumn === ROW_NUMBER_KEY;
  const keyIndex = useRowNumber ? -1 : sheet.headers.indexOf(keyColumn);
  if (!useRowNumber && keyIndex === -1) {
    throw new ValidationError("The chosen order ID column was not found in the sheet.", {
      keyColumn: ["Choose one of the columns from the sheet."],
    });
  }

  const seenKeys = new Set<string>();
  const skipped: SkippedRow[] = [];
  const rowDrafts: Array<{ rowKey: string; rowNumber: number; sourceValues: SourceCellValue[] }> = [];

  for (const row of sheet.rows) {
    const rowKey = useRowNumber ? String(row.rowNumber) : toRowKey(row.values[keyIndex]);
    if (rowKey === "") {
      skipped.push({ rowNumber: row.rowNumber, reason: "The order ID cell is empty." });
    } else if (rowKey.length > MAX_ROW_KEY_LENGTH) {
      skipped.push({ rowNumber: row.rowNumber, reason: "The order ID is too long." });
    } else if (seenKeys.has(rowKey)) {
      skipped.push({ rowNumber: row.rowNumber, reason: `Repeated order ID "${rowKey}".` });
    } else {
      seenKeys.add(rowKey);
      rowDrafts.push({ rowKey, rowNumber: row.rowNumber, sourceValues: row.values });
    }
  }

  if (rowDrafts.length === 0) {
    throw new ImportError("No rows could be imported. Check that the order ID column is filled in.");
  }

  await connectToDatabase();
  const batch = await ImportBatchModel.create({
    name: input.batchName,
    originalFileName: input.originalFileName,
    columns: sheet.headers,
    keyColumn,
    rowCount: rowDrafts.length,
    addedColumns: DEFAULT_ADDED_COLUMNS.map((column) => ({
      ...column,
      formula: column.formula ? { ...column.formula } : null,
    })),
  });

  try {
    await OrderRowModel.insertMany(
      rowDrafts.map((draft) => ({
        batchId: batch._id,
        rowKey: draft.rowKey,
        rowNumber: draft.rowNumber,
        sourceValues: draft.sourceValues,
        addedValues: {},
        lastEditedBy: null,
        lastEditedAt: null,
      })),
      { ordered: false },
    );
  } catch (error) {
    await OrderRowModel.deleteMany({ batchId: batch._id });
    await ImportBatchModel.deleteOne({ _id: batch._id });
    console.error("Importing rows failed:", error instanceof Error ? error.message : "unknown error");
    throw new ImportError("Saving the rows failed, so nothing was imported. Please try again.");
  }

  return {
    batchId: batch._id.toString(),
    imported: rowDrafts.length,
    skippedCount: skipped.length,
    skipped: skipped.slice(0, MAX_REPORTED_SKIPPED_ROWS),
  };
}

/** Deletes a batch and every row in it (customer data does not have to live forever). */
export async function deleteBatch(batchId: string): Promise<void> {
  await connectToDatabase();
  const batch = await ImportBatchModel.findById(batchId).select("_id").lean();
  if (!batch) throw new NotFoundError("This sheet no longer exists.");
  await OrderRowModel.deleteMany({ batchId });
  await ImportBatchModel.deleteOne({ _id: batchId });
}

function findMoneyInputColumn(key: string, columns: readonly ColumnDefinition[]): ColumnDefinition {
  const column = columns.find((candidate) => candidate.key === key);
  if (!column || column.kind !== "input" || column.type !== "money") {
    throw new ValidationError("Calculated columns can only use typed money columns.");
  }
  return column;
}

/** Adds a typed or calculated column to a batch. */
export async function addColumn(batchId: string, input: CreateColumnInput): Promise<ColumnDefinition> {
  await connectToDatabase();
  const batch = await ImportBatchModel.findById(batchId).lean<LeanBatch>();
  if (!batch) throw new NotFoundError("This sheet no longer exists.");

  const existing = batch.addedColumns;
  if (existing.length >= MAX_ADDED_COLUMNS) {
    throw new ConflictError(`A sheet can have at most ${MAX_ADDED_COLUMNS} added columns.`);
  }
  if (existing.some((column) => column.label.toLowerCase() === input.label.toLowerCase())) {
    throw new ConflictError(`A column named "${input.label}" already exists.`);
  }

  const key = toColumnKey(input.label, new Set(existing.map((column) => column.key)));
  let column: ColumnDefinition;
  if (input.kind === "input") {
    column = { key, label: input.label, type: input.type, kind: "input", formula: null };
  } else {
    if (input.leftKey === input.rightKey) throw new ValidationError("Choose two different columns.");
    findMoneyInputColumn(input.leftKey, existing);
    findMoneyInputColumn(input.rightKey, existing);
    column = {
      key,
      label: input.label,
      type: "money",
      kind: "calculated",
      formula: {
        operation: input.operation,
        leftKey: input.leftKey,
        rightKey: input.rightKey,
        floorAtZero: input.floorAtZero,
      },
    };
  }

  const result = await ImportBatchModel.updateOne(
    { _id: batchId, "addedColumns.key": { $ne: key } },
    { $push: { addedColumns: column } },
  );
  if (result.modifiedCount === 0) {
    throw new ConflictError("The columns changed at the same time. Please try again.");
  }
  return column;
}

/** Removes an added column. Refused while another calculated column still uses it. */
export async function removeColumn(batchId: string, columnKey: string): Promise<void> {
  await connectToDatabase();
  const batch = await ImportBatchModel.findById(batchId).lean<LeanBatch>();
  if (!batch) throw new NotFoundError("This sheet no longer exists.");

  const column = batch.addedColumns.find((candidate) => candidate.key === columnKey);
  if (!column) throw new NotFoundError("That column no longer exists.");

  const dependent = batch.addedColumns.find(
    (candidate) =>
      candidate.key !== columnKey &&
      candidate.formula !== null &&
      (candidate.formula.leftKey === columnKey || candidate.formula.rightKey === columnKey),
  );
  if (dependent) {
    throw new ConflictError(`Delete "${dependent.label}" first, because it uses "${column.label}".`);
  }

  if (column.kind === "input") {
    await OrderRowModel.updateMany({ batchId }, { $unset: { [`addedValues.${columnKey}`]: "" } });
  }
  await ImportBatchModel.updateOne({ _id: batchId }, { $pull: { addedColumns: { key: columnKey } } });
}