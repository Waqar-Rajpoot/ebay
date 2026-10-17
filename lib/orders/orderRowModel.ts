import { model, models, Schema, type Model, type Types } from "mongoose";
import { MAX_ROW_KEY_LENGTH } from "./orderConstants";
import type { AddedCellValue, SourceCellValue } from "./orderTypes";

export interface OrderRowDocument {
  batchId: Types.ObjectId;
  rowKey: string;
  rowNumber: number;
  /** Aligned with the batch's `columns` array, so odd header text can never break a field name. */
  sourceValues: SourceCellValue[];
  addedValues: Record<string, AddedCellValue>;
  lastEditedBy: string | null;
  lastEditedAt: Date | null;
}

const orderRowSchema = new Schema<OrderRowDocument>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "ImportBatch", required: true },
    rowKey: { type: String, required: true, maxlength: MAX_ROW_KEY_LENGTH },
    rowNumber: { type: Number, required: true, min: 1 },
    sourceValues: { type: [Schema.Types.Mixed], default: [] },
    addedValues: { type: Schema.Types.Mixed, default: {} },
    lastEditedBy: { type: String, default: null },
    lastEditedAt: { type: Date, default: null },
  },
  // Keep an empty addedValues object so single-cell updates always have a parent to write into.
  { minimize: false },
);

orderRowSchema.index({ batchId: 1, rowKey: 1 }, { unique: true });
orderRowSchema.index({ batchId: 1, rowNumber: 1 });

/** One order (one sheet row) with the team's added values. */
export const OrderRowModel: Model<OrderRowDocument> =
  (models.OrderRow as Model<OrderRowDocument> | undefined) ??
  model<OrderRowDocument>("OrderRow", orderRowSchema);