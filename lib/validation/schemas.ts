import { z } from "zod";
import { MAX_CODE_LENGTH } from "@/lib/access/accessConstants";
import { ACCESS_ROLES } from "@/lib/access/accessRoles";
import {
  CALCULATION_OPERATIONS,
  COLUMN_KEY_PATTERN,
  COLUMN_TYPES,
  MAX_BATCH_NAME_LENGTH,
  MAX_COLUMN_KEY_LENGTH,
  MAX_COLUMN_LABEL_LENGTH,
  MAX_EDITOR_NAME_LENGTH,
  MAX_HEADER_LENGTH,
  MAX_TEXT_VALUE_LENGTH,
} from "@/lib/orders/orderConstants";

/** Header text can gain a " (2)" style suffix, so allow a little extra room. */
const HEADER_SUFFIX_ALLOWANCE = 10;

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id.");

export const columnKeySchema = z
  .string()
  .max(MAX_COLUMN_KEY_LENGTH)
  .regex(COLUMN_KEY_PATTERN, "Choose a valid column.");

export const accessRequestSchema = z.object({
  role: z.enum(ACCESS_ROLES),
  code: z.string().min(1, "Enter the access code.").max(MAX_CODE_LENGTH),
});

export const importMetadataSchema = z.object({
  batchName: z.string().trim().min(1, "Enter a name for this sheet.").max(MAX_BATCH_NAME_LENGTH),
  keyColumn: z
    .string()
    .min(1, "Choose the order ID column.")
    .max(MAX_HEADER_LENGTH + HEADER_SUFFIX_ALLOWANCE),
});

const columnLabelSchema = z
  .string()
  .trim()
  .min(1, "Enter a column name.")
  .max(MAX_COLUMN_LABEL_LENGTH, `Use at most ${MAX_COLUMN_LABEL_LENGTH} characters.`);

export const createColumnSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("input"),
    label: columnLabelSchema,
    type: z.enum(COLUMN_TYPES),
  }),
  z.object({
    kind: z.literal("calculated"),
    label: columnLabelSchema,
    operation: z.enum(CALCULATION_OPERATIONS),
    leftKey: columnKeySchema,
    rightKey: columnKeySchema,
    floorAtZero: z.boolean(),
  }),
]);

export const cellUpdateSchema = z.object({
  columnKey: columnKeySchema,
  /** Raw text typed by the user; null or blank clears the cell. */
  value: z.string().max(MAX_TEXT_VALUE_LENGTH).nullable(),
  /** The value the browser last saw, so a clash with another editor is detected. */
  expectedValue: z.union([z.string().max(MAX_TEXT_VALUE_LENGTH), z.number(), z.null()]),
  editorName: z.string().trim().min(1, "Enter your name first.").max(MAX_EDITOR_NAME_LENGTH),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type CellUpdateInput = z.infer<typeof cellUpdateSchema>;