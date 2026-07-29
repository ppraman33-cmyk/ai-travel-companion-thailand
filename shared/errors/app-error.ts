export type AppErrorCode =
  | "VALIDATION"
  | "PERMISSION"
  | "PROVIDER"
  | "RATE_LIMIT"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "UNEXPECTED";

export interface AppError {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly cause?: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export const appError = (
  code: AppErrorCode,
  message: string,
  options: Pick<AppError, "cause" | "metadata"> & { retryable?: boolean } = {},
): AppError => ({
  code,
  message,
  retryable: options.retryable ?? false,
  cause: options.cause,
  metadata: options.metadata,
});
