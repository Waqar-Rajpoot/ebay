import { model, models, Schema, type Model } from "mongoose";

export interface SyncStateDocument {
  key: string;
  lastSuccessfulSyncAt: Date;
}

const syncStateSchema = new Schema<SyncStateDocument>(
  {
    key: { type: String, required: true, unique: true },
    lastSuccessfulSyncAt: { type: Date, required: true },
  },
  { timestamps: true },
);

/** Remembers where the next sync should start reading from. */
export const SyncStateModel: Model<SyncStateDocument> =
  (models.SyncState as Model<SyncStateDocument> | undefined) ??
  model<SyncStateDocument>("SyncState", syncStateSchema);