import type { StructuredAIProvider } from "@/providers/ai/ai-provider";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

import type {
  AIQuota,
  AIUsageAccounting,
  GroundedAIRequest,
  GroundedAIResult,
} from "./contracts";

const injectionPattern =
  /ignore (?:all|previous)|system prompt|hidden instruction|reveal.*prompt|developer message/i;

export class GroundedAIService {
  constructor(
    private readonly provider: StructuredAIProvider,
    private readonly quota: AIQuota,
    private readonly usage: AIUsageAccounting,
    private readonly options: Readonly<{
      enabled: boolean;
      maximumCandidates: number;
      maximumInstructionCharacters: number;
      maximumRecommendations: number;
      timeoutMs: number;
      estimatedCostPerUnit: number;
    }>,
  ) {}

  async respond(
    request: GroundedAIRequest,
  ): Promise<Result<GroundedAIResult, AppError>> {
    if (!this.options.enabled) {
      return failure(appError("UNAVAILABLE", "AI assistance is currently disabled."));
    }
    if (
      request.instruction.length > this.options.maximumInstructionCharacters ||
      request.candidates.length > this.options.maximumCandidates
    ) {
      return failure(
        appError("VALIDATION", "AI request exceeds the approved size boundary."),
      );
    }
    if (injectionPattern.test(request.instruction)) {
      await this.record(request.sessionId, "refused", 0, 0, "prompt_injection");
      return failure(
        appError("PERMISSION", "The request contains unsupported instructions."),
      );
    }
    if (request.emergencyContext) {
      await this.record(request.sessionId, "refused", 0, 0, "emergency_restricted");
      return success({
        text: "AI cannot provide emergency dispatch, diagnosis, or invented contact details.",
        recommendedRecordIds: [],
        assumptions: [],
        warnings: ["Use only verified emergency information shown by the application."],
        unresolvedQuestions: [],
        groundingReferences: [],
        supportStatus: "refused",
        authoritativeRecords: [],
      });
    }

    const quota = await this.quota.checkAndConsume(request.sessionId);
    if (!quota.ok) return quota;

    const providerResult = await this.withTimeout(
      this.provider.generate({
        instruction: request.instruction,
        candidates: request.candidates,
        maximumRecommendations: this.options.maximumRecommendations,
        language: request.language,
      }),
    );
    if (!providerResult.ok) {
      await this.record(request.sessionId, "failed", 0, 0, providerResult.error.code);
      return providerResult;
    }

    const allowedIds = new Set(request.candidates.map((candidate) => candidate.id));
    const returnedIds = [
      ...providerResult.value.recommendedRecordIds,
      ...providerResult.value.groundingReferences,
    ];
    if (returnedIds.some((id) => !allowedIds.has(id))) {
      await this.record(request.sessionId, "failed", 0, 0, "unknown_record");
      return failure(
        appError("PROVIDER", "AI output referenced an unavailable catalog record."),
      );
    }
    if (
      providerResult.value.recommendedRecordIds.length >
      this.options.maximumRecommendations
    ) {
      return failure(
        appError("PROVIDER", "AI output exceeded the recommendation limit."),
      );
    }

    const inputUnits = providerResult.value.inputUnits ?? 0;
    const outputUnits = providerResult.value.outputUnits ?? 0;
    const accounting = await this.record(
      request.sessionId,
      "completed",
      inputUnits,
      outputUnits,
    );
    if (!accounting.ok) return accounting;

    const selected = request.candidates.filter((candidate) =>
      providerResult.value.recommendedRecordIds.includes(candidate.id),
    );
    return success({ ...providerResult.value, authoritativeRecords: selected });
  }

  private async withTimeout<T>(
    operation: Promise<Result<T, AppError>>,
  ): Promise<Result<T, AppError>> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<Result<T, AppError>>((resolve) => {
      timeout = setTimeout(
        () =>
          resolve(
            failure(
              appError("UNAVAILABLE", "AI provider timed out.", { retryable: true }),
            ),
          ),
        this.options.timeoutMs,
      );
    });
    const result = await Promise.race([operation, deadline]);
    if (timeout) clearTimeout(timeout);
    return result;
  }

  private record(
    sessionId: string,
    status: "completed" | "failed" | "refused",
    inputUnits: number,
    outputUnits: number,
    failureCategory?: string,
  ) {
    return this.usage.record({
      sessionId,
      status,
      requestCategory: "grounded_travel_assistant",
      modelIdentifier: this.provider.providerName,
      inputUnits,
      outputUnits,
      estimatedCost: (inputUnits + outputUnits) * this.options.estimatedCostPerUnit,
      failureCategory,
    });
  }
}
