import type { ErrorResponseBody, FieldErrors } from "@/lib/errors/appErrors";

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again.";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const DEFAULT_DOWNLOAD_NAME = "orders.xlsx";

/** Error thrown by client-side requests; the message is safe to show in a toast. */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: FieldErrors;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, fieldErrors?: FieldErrors, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

/** Builds fetch options for a JSON request. */
export function jsonInit(method: "POST" | "PATCH" | "DELETE", body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

async function fetchOrThrow(input: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiClientError(NETWORK_ERROR_MESSAGE, "NETWORK_ERROR", 0);
  }

  if (!response.ok) {
    let body: Partial<ErrorResponseBody> | null = null;
    try {
      body = (await response.json()) as Partial<ErrorResponseBody>;
    } catch {
      body = null;
    }
    throw new ApiClientError(
      body?.error?.message ?? GENERIC_ERROR_MESSAGE,
      body?.error?.code ?? "UNKNOWN_ERROR",
      response.status,
      body?.error?.fieldErrors,
      body?.error?.details,
    );
  }
  return response;
}

/** Sends a request and returns the parsed JSON body, or throws ApiClientError. */
export async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetchOrThrow(input, init);
  return (await response.json()) as T;
}

/** Downloads a file response, returning the blob and the server-suggested file name. */
export async function requestBlob(input: string): Promise<{ blob: Blob; fileName: string }> {
  const response = await fetchOrThrow(input);
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? DEFAULT_DOWNLOAD_NAME;
  return { blob: await response.blob(), fileName };
}

/** Saves a blob to the user's computer. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** A message that is always safe to show to the user. */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiClientError ? error.message : GENERIC_ERROR_MESSAGE;
}