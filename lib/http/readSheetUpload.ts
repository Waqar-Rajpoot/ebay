import "server-only";
import { BYTES_PER_MEGABYTE, getUploadLimits } from "@/lib/config";
import { PayloadTooLargeError, ValidationError } from "@/lib/errors/appErrors";
import { EXCEL_FILE_EXTENSION, MAX_FILE_NAME_LENGTH, XLSX_SIGNATURE_BYTES } from "@/lib/orders/orderConstants";

export interface SheetUpload {
  formData: FormData;
  fileName: string;
  buffer: Buffer;
}

/** Reads and checks an uploaded .xlsx file (type, size, and file signature). */
export async function readSheetUpload(request: Request): Promise<SheetUpload> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ValidationError("The upload could not be read. Please choose the file again.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) throw new ValidationError("Choose an .xlsx file to upload.");
  if (!file.name.toLowerCase().endsWith(EXCEL_FILE_EXTENSION)) {
    throw new ValidationError("Only .xlsx files are supported. Save .xls or .csv files as .xlsx first.");
  }
  if (file.size === 0) throw new ValidationError("The file is empty.");

  const { maxFileBytes } = getUploadLimits();
  if (file.size > maxFileBytes) {
    throw new PayloadTooLargeError(
      `The file is larger than ${Math.round(maxFileBytes / BYTES_PER_MEGABYTE)} MB. Split it into smaller sheets.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const [firstByte, secondByte] = XLSX_SIGNATURE_BYTES;
  if (buffer[0] !== firstByte || buffer[1] !== secondByte) {
    throw new ValidationError("This does not look like a valid .xlsx file.");
  }

  return { formData, fileName: file.name.slice(0, MAX_FILE_NAME_LENGTH), buffer };
}