import { IMAGE_FILE_EXTENSIONS, IMAGE_UPLOAD_MAX_BYTES, MULTIPART_OVERHEAD_BYTES } from "@/lib/images/imageConstants";
import { uploadImageToImageKit } from "@/lib/images/imageKitService";
import { detectImageType, getImageFileError } from "@/lib/images/imageValidation";
import { guardMutationRequest } from "@/lib/security/requestGuards";
import { UPLOAD_RATE_LIMIT } from "@/lib/security/securityConstants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Validates an image upload and stores it on ImageKit. */
export async function POST(request: Request): Promise<Response> {
  const rejection = guardMutationRequest(request, UPLOAD_RATE_LIMIT);
  if (rejection) return rejection;

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > IMAGE_UPLOAD_MAX_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return Response.json({ message: "Image is too large." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ message: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ message: "No image provided." }, { status: 400 });
  }

  const fileError = getImageFileError({ type: file.type, size: file.size });
  if (fileError) return Response.json({ message: fileError }, { status: 422 });

  const content = Buffer.from(await file.arrayBuffer());
  const detectedType = detectImageType(content);
  if (!detectedType) {
    return Response.json({ message: "File content is not a supported image." }, { status: 422 });
  }

  try {
    const image = await uploadImageToImageKit(content, IMAGE_FILE_EXTENSIONS[detectedType]);
    return Response.json(image, { status: 201 });
  } catch (error) {
    // Log the message only: the full axios error includes the Authorization header.
    console.error("Image upload failed:", (error as Error).message);
    return Response.json({ message: "Could not upload the image." }, { status: 502 });
  }
}