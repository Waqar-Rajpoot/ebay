import { model, models, Schema, type Model } from "mongoose";
import { CALCULATION_OPERATIONS, COLUMN_KINDS, COLUMN_TYPES } from "./orderConstants";
import type { ColumnDefinition } from "./orderTypes";

export interface ImportBatchDocument {
  name: string;
  originalFileName: string;
  columns: string[];
  keyColumn: string;
  rowCount: number;
  addedColumns: ColumnDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

const formulaSchema = new Schema(
  {
    operation: { type: String, enum: [...CALCULATION_OPERATIONS], required: true },
    leftKey: { type: String, required: true },
    rightKey: { type: String, required: true },
    floorAtZero: { type: Boolean, required: true },
  },
  { _id: false },
);

const columnDefinitionSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: [...COLUMN_TYPES], required: true },
    kind: { type: String, enum: [...COLUMN_KINDS], required: true },
    formula: { type: formulaSchema, default: null },
  },
  { _id: false },
);

const importBatchSchema = new Schema<ImportBatchDocument>(
  {
    name: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true },
    columns: { type: [String], required: true },
    keyColumn: { type: String, required: true },
    rowCount: { type: Number, required: true, min: 0 },
    addedColumns: { type: [columnDefinitionSchema], default: [] },
  },
  { timestamps: true },
);

importBatchSchema.index({ createdAt: -1 });

/** One uploaded sheet: its columns, key column, and the added columns. */
export const ImportBatchModel: Model<ImportBatchDocument> =
  (models.ImportBatch as Model<ImportBatchDocument> | undefined) ??
  model<ImportBatchDocument>("ImportBatch", importBatchSchema);