import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface RateLimitDecision {
  readonly remaining: number;
  readonly resetAt: string;
}

export interface RateLimiter {
  consume(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Result<RateLimitDecision, AppError>;
}
