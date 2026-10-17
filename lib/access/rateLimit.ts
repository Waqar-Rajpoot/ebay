import "server-only";
import { model, models, Schema, type Model } from "mongoose";
import { RateLimitError } from "@/lib/errors/appErrors";
import { ACCESS_ATTEMPT_WINDOW_SECONDS, MAX_FAILED_ACCESS_ATTEMPTS } from "./accessConstants";

interface AccessAttemptDocument {
  identifier: string;
  failedCount: number;
  expiresAt: Date;
}

const accessAttemptSchema = new Schema<AccessAttemptDocument>({
  identifier: { type: String, required: true, unique: true },
  failedCount: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});
// MongoDB removes expired records on its own, so counters reset without any cleanup job.
accessAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AccessAttemptModel: Model<AccessAttemptDocument> =
  (models.AccessAttempt as Model<AccessAttemptDocument> | undefined) ??
  model<AccessAttemptDocument>("AccessAttempt", accessAttemptSchema);

/** Best-effort caller identity for rate limiting. */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** @throws RateLimitError when too many wrong codes were entered recently. */
export async function assertNotRateLimited(identifier: string): Promise<void> {
  const attempt = await AccessAttemptModel.findOne({ identifier, expiresAt: { $gt: new Date() } }).lean();
  if (attempt && attempt.failedCount >= MAX_FAILED_ACCESS_ATTEMPTS) {
    throw new RateLimitError("Too many wrong codes. Please wait a few minutes and try again.");
  }
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const now = new Date();
  await AccessAttemptModel.deleteMany({ identifier, expiresAt: { $lte: now } });
  await AccessAttemptModel.updateOne(
    { identifier },
    {
      $inc: { failedCount: 1 },
      $setOnInsert: { expiresAt: new Date(now.getTime() + ACCESS_ATTEMPT_WINDOW_SECONDS * 1000) },
    },
    { upsert: true },
  );
}

export async function clearFailedAttempts(identifier: string): Promise<void> {
  await AccessAttemptModel.deleteOne({ identifier });
}