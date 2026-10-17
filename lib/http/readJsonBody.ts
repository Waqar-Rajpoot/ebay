import { ValidationError } from "@/lib/errors/appErrors";

/** Reads a JSON request body, turning malformed JSON into a ValidationError. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("The request body must be valid JSON.");
  }
}