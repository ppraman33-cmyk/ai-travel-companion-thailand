import type { TravelerSession } from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface TravelerSessionBoundary {
  getOrCreateAnonymousSession(): Promise<Result<TravelerSession, AppError>>;
  clearSession(): Promise<Result<void, AppError>>;
}
