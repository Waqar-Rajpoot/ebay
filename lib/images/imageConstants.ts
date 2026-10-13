export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const IMAGE_FILE_EXTENSIONS: Record<AllowedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
export const IMAGE_URL_MAX_LENGTH = 2048;
export const IMAGE_FILE_ID_MAX_LENGTH = 64;

export const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
export const IMAGEKIT_UPLOAD_TIMEOUT_MS = 20_000;