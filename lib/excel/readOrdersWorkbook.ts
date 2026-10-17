import "server-only";
import ExcelJS from "exceljs";
import type { UploadLimits } from "@/lib/config";
import { ImportError } from "@/lib/errors/appErrors";
import { MAX_SHEET_COLUMNS, MAX_SOURCE_CELL_LENGTH } from "@/lib/orders/orderConstants";
import type { SourceCellValue } from "@/lib/orders/orderTypes";
import { buildUniqueHeaders } from "./headerMatching";

export interface SheetRow {
  /** Row number in the original sheet, starting at 1. */
  rowNumber: number;
  values: SourceCellValue[];
}

export interface ParsedSheet {
  sheetName: string;
  headers: string[];
  rows: SheetRow[];
  warnings: string[];
}

const MIDNIGHT_UTC_SUFFIX = "T00:00:00.000Z";
const DATE_ONLY_LENGTH = 10;

function formatDateValue(date: Date): string | null {
  if (Number.isNaN(date.getTime())) return null;
  const iso = date.toISOString();
  return iso.endsWith(MIDNIGHT_UTC_SUFFIX) ? iso.slice(0, DATE_ONLY_LENGTH) : iso;
}

/** Turns any ExcelJS cell value (text, number, date, formula, rich text, link) into a plain value. */
function readCellValue(value: unknown): SourceCellValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const text = value.trim();
    return text === "" ? null : text.slice(0, MAX_SOURCE_CELL_LENGTH);
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return formatDateValue(value);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.richText)) {
      const text = record.richText
        .map((part: { text?: unknown }) => (typeof part.text === "string" ? part.text : ""))
        .join("");
      return readCellValue(text);
    }
    if ("result" in record) return readCellValue(record.result);
    if ("text" in record) return readCellValue(record.text);
  }
  return null;
}

function readRowValues(row: ExcelJS.Row, columnCount: number): SourceCellValue[] {
  const values: SourceCellValue[] = [];
  for (let column = 1; column <= columnCount; column += 1) {
    values.push(readCellValue(row.getCell(column).value));
  }
  return values;
}

/**
 * Reads the first sheet of an .xlsx file. The first non-empty row is the header row;
 * columns are identified by header text, never by position.
 * @throws ImportError for unreadable, empty, too wide, or too long sheets.
 */
export async function readOrdersWorkbook(buffer: any, limits: UploadLimits): Promise<ParsedSheet> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new ImportError("The file could not be read. Make sure it is a valid, unprotected .xlsx file.");
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new ImportError("The workbook has no sheets.");

  const state: { headers: string[] | null; rows: SheetRow[]; warnings: string[] } = {
    headers: null,
    rows: [],
    warnings: workbook.worksheets.length > 1 ? [`Only the first sheet ("${worksheet.name}") is imported.`] : [],
  };

  worksheet.eachRow((row, rowNumber) => {
    if (state.headers === null) {
      const cells = readRowValues(row, Math.min(row.cellCount, MAX_SHEET_COLUMNS + 1));
      const lastFilledIndex = cells.findLastIndex((cell) => cell !== null);
      if (lastFilledIndex === -1) return;
      if (lastFilledIndex + 1 > MAX_SHEET_COLUMNS) {
        throw new ImportError(`The sheet has more than ${MAX_SHEET_COLUMNS} columns.`);
      }
      const result = buildUniqueHeaders(cells.slice(0, lastFilledIndex + 1));
      state.headers = result.headers;
      state.warnings.push(...result.warnings);
      return;
    }

    const values = readRowValues(row, state.headers.length);
    if (values.every((value) => value === null)) return;
    if (state.rows.length >= limits.maxRows) {
      throw new ImportError(`The sheet has more than ${limits.maxRows} rows. Split it into smaller sheets.`);
    }
    state.rows.push({ rowNumber, values });
  });

  if (state.headers === null) throw new ImportError("The sheet is empty.");
  if (state.rows.length === 0) throw new ImportError("The sheet has a header row but no data rows.");

  return { sheetName: worksheet.name, headers: state.headers, rows: state.rows, warnings: state.warnings };
}