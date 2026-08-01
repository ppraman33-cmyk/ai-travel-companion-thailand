import type { AIRequest, AIResponse } from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface AIProvider {
  readonly providerName: string;
  generateGroundedResponse(request: AIRequest): Promise<Result<AIResponse, AppError>>;
}

export interface GroundedCandidate {
  readonly id: string;
  readonly kind: "place" | "food" | "event";
  readonly name: string;
  readonly supportedFacts: Readonly<Record<string, string | number | boolean>>;
}

export interface StructuredAIProviderRequest {
  readonly instruction: string;
  readonly candidates: readonly GroundedCandidate[];
  readonly maximumRecommendations: number;
  readonly language: string;
}

export interface StructuredAIProviderResponse {
  readonly text: string;
  readonly recommendedRecordIds: readonly string[];
  readonly assumptions: readonly string[];
  readonly warnings: readonly string[];
  readonly unresolvedQuestions: readonly string[];
  readonly groundingReferences: readonly string[];
  readonly supportStatus: "grounded" | "partial" | "refused";
  readonly inputUnits?: number;
  readonly outputUnits?: number;
}

export interface StructuredAIProvider {
  readonly providerName: string;
  generate(
    request: StructuredAIProviderRequest,
  ): Promise<Result<StructuredAIProviderResponse, AppError>>;
}
