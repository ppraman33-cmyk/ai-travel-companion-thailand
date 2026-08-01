import type {
  StructuredAIProvider,
  StructuredAIProviderRequest,
} from "@/providers/ai/ai-provider";
import { success } from "@/shared/result/result";

export class DeterministicFakeAIProvider implements StructuredAIProvider {
  readonly providerName = "deterministic-fake";

  async generate(request: StructuredAIProviderRequest) {
    const selected = request.candidates.slice(0, request.maximumRecommendations);
    return success({
      text:
        selected.length > 0
          ? "Here is a grounded itinerary suggestion using the supplied catalog."
          : "No eligible catalog records are available.",
      recommendedRecordIds: selected.map((candidate) => candidate.id),
      assumptions: [],
      warnings: [],
      unresolvedQuestions: [],
      groundingReferences: selected.map((candidate) => candidate.id),
      supportStatus: selected.length > 0 ? ("grounded" as const) : ("refused" as const),
      inputUnits: request.instruction.length,
      outputUnits: selected.length * 10,
    });
  }
}
