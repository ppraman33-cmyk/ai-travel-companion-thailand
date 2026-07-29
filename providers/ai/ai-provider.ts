import type { AIRequest, AIResponse } from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface AIProvider {
  readonly providerName: string;
  generateGroundedResponse(request: AIRequest): Promise<Result<AIResponse, AppError>>;
}
