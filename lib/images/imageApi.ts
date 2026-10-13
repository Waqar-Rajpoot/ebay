import { apiClient } from "@/lib/api/apiClient";
import type { UploadedImage } from "@/lib/images/imageTypes";

/** Uploads an image through the app's own API route (keeps the ImageKit key server-side). */
export async function uploadImageRequest(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  const response = await apiClient.post<UploadedImage>("/uploads/image", body);
  return response.data;
}