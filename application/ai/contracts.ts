import type {
  GroundedCandidate,
  StructuredAIProviderResponse,
} from "@/providers/ai/ai-provider";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export interface GroundedAIRequest {
  readonly sessionId: string;
  readonly instruction: string;
  readonly language: string;
  readonly candidates: readonly GroundedCandidate[];
  readonly emergencyContext: boolean;
}

export interface GroundedAIResult extends StructuredAIProviderResponse {
  readonly authoritativeRecords: readonly GroundedCandidate[];
}

export interface AIQuota {
  checkAndConsume(
    sessionId: string,
  ): Promise<Result<{ readonly remaining: number }, AppError>>;
}

export interface AIUsageAccounting {
  record(input: {
    readonly sessionId: string;
    readonly status: "completed" | "failed" | "refused";
    readonly requestCategory: string;
    readonly modelIdentifier: string;
    readonly inputUnits: number;
    readonly outputUnits: number;
    readonly estimatedCost: number;
    readonly failureCategory?: string;
  }): Promise<Result<void, AppError>>;
}
