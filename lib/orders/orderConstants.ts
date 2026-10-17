export const COLUMN_TYPES = ["money", "text", "number"] as const;
export const COLUMN_KINDS = ["input", "calculated"] as const;
export const CALCULATION_OPERATIONS = ["add", "subtract"] as const;

/** Key column value meaning "use the sheet row number as the order ID". */
export const ROW_NUMBER_KEY = "__row_number__";
export const ROW_NUMBER_LABEL = "Row number (the sheet has no order ID column)";

export const MAX_FILE_NAME_LENGTH = 200;
export const MAX_BATCH_NAME_LENGTH = 100;
export const MAX_HEADER_LENGTH = 100;
export const MAX_SOURCE_CELL_LENGTH = 2000;
export const MAX_ROW_KEY_LENGTH = 200;
export const MAX_SHEET_COLUMNS = 100;
export const MAX_TEXT_VALUE_LENGTH = 1000;
export const MAX_COLUMN_LABEL_LENGTH = 40;
export const MAX_COLUMN_KEY_LENGTH = 40;
export const MAX_ADDED_COLUMNS = 20;
export const MAX_EDITOR_NAME_LENGTH = 60;
export const COLUMN_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export const MONEY_DECIMAL_PLACES = 2;
export const MINOR_UNITS_PER_MAJOR_UNIT = 100;
export const MAX_MONEY_MINOR_UNITS = 100_000_000_000;
export const MAX_NUMBER_VALUE = 1_000_000_000_000;

export const PREVIEW_ROW_COUNT = 5;
export const MAX_REPORTED_SKIPPED_ROWS = 50;
export const ROWS_PER_PAGE = 50;

export const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const EXCEL_FILE_EXTENSION = ".xlsx";
/** First two bytes of every .xlsx file (it is a zip archive: "PK"). */
export const XLSX_SIGNATURE_BYTES = [0x50, 0x4b] as const;

export const EDITOR_NAME_STORAGE_KEY = "orderPortalEditorName";