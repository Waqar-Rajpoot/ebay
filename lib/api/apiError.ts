import axios from "axios";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "Network error. Check your connection.";

export interface ApiErrorDetails {
  status: number | null;
  message: string;
  fieldErrors: Record<string, string> | null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

/** Normalizes any thrown value from an axios call into a displayable shape. */
export function extractApiError(error: unknown): ApiErrorDetails {
  if (!axios.isAxiosError(error)) {
    return { status: null, message: FALLBACK_MESSAGE, fieldErrors: null };
  }
  if (!error.response) {
    return { status: null, message: NETWORK_MESSAGE, fieldErrors: null };
  }

  const data: unknown = error.response.data;
  const body = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};

  return {
    status: error.response.status,
    message: typeof body.message === "string" ? body.message : FALLBACK_MESSAGE,
    fieldErrors: isStringRecord(body.errors) ? body.errors : null,
  };
}