import type { AdminActor } from "@/application/content/types";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface AdminAccessBoundary {
  resolveCurrentAdmin(): Promise<Result<AdminActor | null, AppError>>;
}
