// import { model, models, Schema, type Model } from "mongoose";

// /** Same values as your existing role type. Replace with that import once I've seen accessRoles.ts. */
// export type AccessCodeRole = "admin" | "team";

// export interface AccessCodeDocument {
//   role: AccessCodeRole;
//   codeHash: string;
//   /** Raised on every change so old login cookies can be rejected. */
//   version: number;
//   updatedAt: Date;
// }

// const accessCodeSchema = new Schema<AccessCodeDocument>(
//   {
//     role: { type: String, enum: ["admin", "team"], required: true, unique: true },
//     codeHash: { type: String, required: true },
//     version: { type: Number, required: true, default: 1 },
//   },
//   { timestamps: { createdAt: false, updatedAt: true } },
// );

// export const AccessCodeModel: Model<AccessCodeDocument> =
//   (models.AccessCode as Model<AccessCodeDocument> | undefined) ??
//   model<AccessCodeDocument>("AccessCode", accessCodeSchema);





import { model, models, Schema, type Model } from "mongoose";
import { ACCESS_ROLES, type AccessRole } from "./accessRoles";

export interface AccessCodeDocument {
  role: AccessRole;
  codeHash: string;
  /** Raised on every change; login cookies carry it so old logins stop working. */
  version: number;
  updatedAt: Date;
}

const accessCodeSchema = new Schema<AccessCodeDocument>(
  {
    role: { type: String, enum: [...ACCESS_ROLES], required: true, unique: true },
    codeHash: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const AccessCodeModel: Model<AccessCodeDocument> =
  (models.AccessCode as Model<AccessCodeDocument> | undefined) ??
  model<AccessCodeDocument>("AccessCode", accessCodeSchema);