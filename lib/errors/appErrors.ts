export type FieldErrors = Record<string, string[]>;

/** Shape of every error response body sent by the API. */
export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldErrors;
    details?: Record<string, unknown>;
  };
}

/** Base class for errors whose message is safe to show to the user. */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors?: FieldErrors;

  constructor(message: string, fieldErrors?: FieldErrors) {
    super(message, "VALIDATION_ERROR", 400);
    this.fieldErrors = fieldErrors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please enter the access code to continue.") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "That item no longer exists.") {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, details);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string) {
    super(message, "PAYLOAD_TOO_LARGE", 413);
  }
}

export class ImportError extends AppError {
  constructor(message: string) {
    super(message, "IMPORT_ERROR", 422);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, "RATE_LIMITED", 429);
  }
}