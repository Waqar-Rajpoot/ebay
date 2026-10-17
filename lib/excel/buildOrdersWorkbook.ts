import "server-only";
import ExcelJS from "exceljs";
import { APP_NAME } from "@/lib/constants";
import { calculateColumnValue } from "@/lib/orders/calculatedColumns";
import { minorUnitsToMajor } from "@/lib/orders/money";
import { summarizeRows } from "@/lib/orders/orderMetrics";
import type {
  AddedCellValue,
  BatchDetails,
  CalculationFormula,
  ColumnDefinition,
  OrderRowDto,
  SourceCellValue,
} from "@/lib/orders/orderTypes";

const MONEY_NUMBER_FORMAT = "#,##0.00";
const TEXT_NUMBER_FORMAT = "@";
const FORMULA_START_PATTERN = /^[=+\-@]/;
const MIN_COLUMN_WIDTH = 10;
const MAX_COLUMN_WIDTH = 40;
const HEADER_FILL_COLOR = "FFEEF3F8";

/**
 * ExcelJS stores plain strings as text, so they are never run as formulas.
 * Text that starts with a formula character also gets the text format, as a second safeguard.
 */
function writeTextCell(cell: ExcelJS.Cell, text: string): void {
  cell.value = text;
  if (FORMULA_START_PATTERN.test(text)) cell.numFmt = TEXT_NUMBER_FORMAT;
}

function writeSourceCell(cell: ExcelJS.Cell, value: SourceCellValue): void {
  if (value === null) return;
  if (typeof value === "string") writeTextCell(cell, value);
  else cell.value = value;
}

function writeInputCell(cell: ExcelJS.Cell, column: ColumnDefinition, value: AddedCellValue): void {
  if (value === null) return;
  if (typeof value === "string") {
    writeTextCell(cell, value);
    return;
  }
  if (column.type === "money") {
    cell.value = minorUnitsToMajor(value);
    cell.numFmt = MONEY_NUMBER_FORMAT;
    return;
  }
  cell.value = value;
}

function buildFormulaText(formula: CalculationFormula, left: string, right: string): string {
  const expression = formula.operation === "add" ? `${left}+${right}` : `${left}-${right}`;
  const core = formula.floorAtZero ? `MAX(0,${expression})` : expression;
  // Stay blank until both prices are typed, matching what the team page shows.
  return `IF(OR(${left}="",${right}=""),"",${core})`;
}

/**
 * Builds the downloadable workbook: an Orders sheet (original columns, then added columns,
 * with calculated columns as real Excel formulas) and a Summary sheet with totals.
 */
export async function buildOrdersWorkbook(batch: BatchDetails, rows: readonly OrderRowDto[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = APP_NAME;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Orders", { views: [{ state: "frozen", ySplit: 1 }] });
  const sourceCount = batch.columns.length;
  const allHeaders = [...batch.columns, ...batch.addedColumns.map((column) => column.label)];

  const headerRow = sheet.getRow(1);
  allHeaders.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    writeTextCell(cell, header);
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL_COLOR } };
    sheet.getColumn(index + 1).width = Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, header.length + 2));
  });

  const columnIndexByKey = new Map(batch.addedColumns.map((column, index) => [column.key, sourceCount + index + 1]));
  const letterFor = (key: string): string | null => {
    const index = columnIndexByKey.get(key);
    return index === undefined ? null : sheet.getColumn(index).letter;
  };

  rows.forEach((row, rowIndex) => {
    const excelRowNumber = rowIndex + 2;
    const excelRow = sheet.getRow(excelRowNumber);

    row.sourceValues.forEach((value, index) => writeSourceCell(excelRow.getCell(index + 1), value));

    batch.addedColumns.forEach((column, index) => {
      const cell = excelRow.getCell(sourceCount + index + 1);
      if (column.kind === "input") {
        writeInputCell(cell, column, row.addedValues[column.key] ?? null);
        return;
      }
      const { formula } = column;
      const leftLetter = formula ? letterFor(formula.leftKey) : null;
      const rightLetter = formula ? letterFor(formula.rightKey) : null;
      if (!formula || !leftLetter || !rightLetter) return;

      const computed = calculateColumnValue(column, row.addedValues);
      cell.value = {
        formula: buildFormulaText(formula, `${leftLetter}${excelRowNumber}`, `${rightLetter}${excelRowNumber}`),
        result: computed === null ? "" : minorUnitsToMajor(computed),
      };
      cell.numFmt = MONEY_NUMBER_FORMAT;
    });
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: allHeaders.length } };

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.getColumn(1).width = 28;
  summarySheet.getColumn(2).width = 22;
  writeTextCell(summarySheet.addRow(["Sheet"]).getCell(2), batch.name);
  summarySheet.addRow(["Orders", rows.length]);
  summarySheet.addRow([]);
  summarySheet.addRow(["Column", "Total"]).font = { bold: true };

  const totals = summarizeRows(rows, batch.addedColumns);
  batch.addedColumns.forEach((column) => {
    if (column.type !== "money") return;
    const letter = letterFor(column.key);
    if (!letter) return;
    const cell = summarySheet.addRow([column.label]).getCell(2);
    cell.value =
      rows.length > 0
        ? {
            formula: `SUM(Orders!${letter}2:${letter}${rows.length + 1})`,
            result: minorUnitsToMajor(totals[column.key] ?? 0),
          }
        : 0;
    cell.numFmt = MONEY_NUMBER_FORMAT;
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}