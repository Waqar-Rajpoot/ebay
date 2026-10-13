import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  type AllowedImageMimeType,
} from "@/lib/images/imageConstants";

const BYTES_PER_MEGABYTE = 1024 * 1024;

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46] as const;
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50] as const;
const WEBP_SIGNATURE_OFFSET = 8;

function isAllowedMimeType(type: string): type is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(type);
}

/** Cheap pre-checks on declared type and size. Usable in the browser and on the server. */
export function getImageFileError(file: { type: string; size: number }): string | null {
  if (!isAllowedMimeType(file.type)) return "Use a JPEG, PNG or WebP image.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return `Image must be ${IMAGE_UPLOAD_MAX_BYTES / BYTES_PER_MEGABYTE} MB or smaller.`;
  }
  return null;
}

/** Identifies the real image format from file bytes; the declared MIME type can be spoofed. */
export function detectImageType(bytes: Uint8Array): AllowedImageMimeType | null {
  const hasSignature = (signature: readonly number[], offset = 0): boolean =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (hasSignature(JPEG_SIGNATURE)) return "image/jpeg";
  if (hasSignature(PNG_SIGNATURE)) return "image/png";
  if (hasSignature(RIFF_SIGNATURE) && hasSignature(WEBP_SIGNATURE, WEBP_SIGNATURE_OFFSET)) {
    return "image/webp";
  }
  return null;
}