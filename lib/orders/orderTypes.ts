import type { CALCULATION_OPERATIONS, COLUMN_KINDS, COLUMN_TYPES } from "./orderConstants";

export type ColumnType = (typeof COLUMN_TYPES)[number];
export type ColumnKind = (typeof COLUMN_KINDS)[number];
export type CalculationOperation = (typeof CALCULATION_OPERATIONS)[number];

/** A cell copied from the uploaded sheet. */
export type SourceCellValue = string | number | boolean | null;

/** A cell in an added column. Money is whole minor units (cents); null means empty. */
export type AddedCellValue = string | number | null;

export interface CalculationFormula {
  operation: CalculationOperation;
  leftKey: string;
  rightKey: string;
  /** When true, a negative result is shown as 0 (used for Profit and Loss). */
  floorAtZero: boolean;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type: ColumnType;
  kind: ColumnKind;
  formula: CalculationFormula | null;
}

export interface BatchSummary {
  id: string;
  name: string;
  originalFileName: string;
  rowCount: number;
  createdAt: string;
}

export interface BatchDetails extends BatchSummary {
  /** Header texts from the uploaded sheet, in sheet order. */
  columns: string[];
  keyColumn: string;
  addedColumns: ColumnDefinition[];
}

export interface OrderRowDto {
  id: string;
  rowNumber: number;
  rowKey: string;
  /** Aligned with BatchDetails.columns. */
  sourceValues: SourceCellValue[];
  addedValues: Record<string, AddedCellValue>;
  lastEditedBy: string | null;
  lastEditedAt: string | null;
}

export interface SheetPreview {
  fileName: string;
  sheetName: string;
  headers: string[];
  previewRows: SourceCellValue[][];
  totalRows: number;
  suggestedKeyColumn: string;
  warnings: string[];
}

export interface SkippedRow {
  rowNumber: number;
  reason: string;
}

export interface ImportResult {
  batchId: string;
  imported: number;
  skippedCount: number;
  skipped: SkippedRow[];
}