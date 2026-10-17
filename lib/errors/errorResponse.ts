import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError, type ErrorResponseBody, type FieldErrors } from "./appErrors";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

function zodToFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path.map(String).join(".") || "_form";
    (fieldErrors[field] ??= []).push(issue.message);
  }
  return fieldErrors;
}

/** Converts any thrown value into the shared JSON error shape. Never leaks internals. */
export function toErrorResponse(error: unknown): NextResponse<ErrorResponseBody> {
  const normalized =
    error instanceof ZodError
      ? new ValidationError(error.issues[0]?.message ?? "Some fields are invalid.", zodToFieldErrors(error))
      : error;

  if (normalized instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: normalized.code,
          message: normalized.message,
          fieldErrors: normalized instanceof ValidationError ? normalized.fieldErrors : undefined,
          details: normalized.details,
        },
      },
      { status: normalized.status },
    );
  }

  console.error("Unhandled error:", normalized instanceof Error ? normalized.message : "unknown error");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: GENERIC_ERROR_MESSAGE } },
    { status: 500 },
  );
}

/** Wraps a route handler so every thrown error becomes a consistent JSON response. */
export function withErrorHandling<Context = unknown>(
  handler: (request: Request, context: Context) => Promise<Response>,
) {
  return async (request: Request, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}