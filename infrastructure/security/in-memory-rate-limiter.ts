import type { RateLimiter } from "@/application/security/rate-limiter";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  consume(key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    const current = this.buckets.get(key);
    const bucket =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowSeconds * 1000 }
        : current;
    bucket.count += 1;
    this.buckets.set(key, bucket);
    if (bucket.count > limit) {
      return failure(
        appError("RATE_LIMIT", "Request limit exceeded.", {
          retryable: true,
          metadata: { resetAt: new Date(bucket.resetAt).toISOString() },
        }),
      );
    }
    return success({
      remaining: Math.max(0, limit - bucket.count),
      resetAt: new Date(bucket.resetAt).toISOString(),
    });
  }
}
