import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import type { AppError } from "@/shared/errors/app-error";

const statusByCode: Readonly<Record<AppError["code"], number>> = {
  VALIDATION: 400,
  PERMISSION: 403,
  PROVIDER: 502,
  RATE_LIMIT: 429,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNAVAILABLE: 503,
  UNEXPECTED: 500,
};

export const correlationId = () => randomUUID();

export function okResponse(data: unknown, requestId: string, status = 200) {
  return NextResponse.json(
    { data, error: null, meta: { requestId } },
    { status, headers: { "x-request-id": requestId } },
  );
}

export function errorResponse(error: AppError, requestId: string) {
  return NextResponse.json(
    {
      data: null,
      error: { code: error.code, message: error.message, retryable: error.retryable },
      meta: { requestId },
    },
    { status: statusByCode[error.code], headers: { "x-request-id": requestId } },
  );
}
