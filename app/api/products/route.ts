import { getImageKitConfig } from "@/lib/config/env";
import { isUrlOnEndpoint } from "@/lib/images/imageUrl";
import { toFieldErrors } from "@/lib/products/fieldErrors";
import { productSchema } from "@/lib/products/productSchema";
import { createProduct } from "@/lib/products/productService";
import { guardMutationRequest, readJsonBody } from "@/lib/security/requestGuards";
import { MAX_JSON_BODY_BYTES, PRODUCT_RATE_LIMIT } from "@/lib/security/securityConstants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Creates a product listing from a JSON body. */
export async function POST(request: Request): Promise<Response> {
  const rejection = guardMutationRequest(request, PRODUCT_RATE_LIMIT);
  if (rejection) return rejection;

  const body = await readJsonBody(request, MAX_JSON_BODY_BYTES);
  if (!body.ok) return body.response;

  const parsed = productSchema.safeParse(body.value);
  if (!parsed.success) {
    return Response.json({ errors: toFieldErrors(parsed.error.issues) }, { status: 422 });
  }

  try {
    // Only images this app uploaded to ImageKit are accepted, never arbitrary URLs.
    const { urlEndpoint } = getImageKitConfig();
    if (!isUrlOnEndpoint(parsed.data.imageUrl, urlEndpoint)) {
      return Response.json(
        { errors: { imageUrl: "Image must be uploaded through this app." } },
        { status: 422 }
      );
    }

    const product = await createProduct(parsed.data);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Failed to save product:", (error as Error).message);
    return Response.json({ message: "Could not save the product." }, { status: 500 });
  }
}