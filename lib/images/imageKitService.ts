import "server-only";
import axios from "axios";
import { randomUUID } from "node:crypto";
import { getImageKitConfig } from "@/lib/config/env";
import { IMAGEKIT_UPLOAD_TIMEOUT_MS, IMAGEKIT_UPLOAD_URL } from "@/lib/images/imageConstants";
import type { UploadedImage } from "@/lib/images/imageTypes";

interface ImageKitUploadResponse {
  url: string;
  fileId: string;
}

/**
 * Uploads image bytes to ImageKit via its REST API and returns the hosted URL.
 * The file name is generated here, so user input never reaches the storage path.
 */
export async function uploadImageToImageKit(content: Buffer, extension: string): Promise<UploadedImage> {
  const { privateKey, uploadFolder } = getImageKitConfig();

  const body = new FormData();
  body.append("file", content.toString("base64"));
  body.append("fileName", `${randomUUID()}.${extension}`);
  body.append("folder", uploadFolder);
  body.append("useUniqueFileName", "true");

  const response = await axios.post<ImageKitUploadResponse>(IMAGEKIT_UPLOAD_URL, body, {
    // ImageKit expects the private key as the Basic-auth username with an empty password.
    auth: { username: privateKey, password: "" },
    timeout: IMAGEKIT_UPLOAD_TIMEOUT_MS,
  });

  return { url: response.data.url, fileId: response.data.fileId };
}