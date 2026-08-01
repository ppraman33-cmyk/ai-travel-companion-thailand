import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

import type { AdminActor, ContentEntityKind, ContentLifecycleStatus } from "./types";

const transitions: Readonly<
  Record<ContentLifecycleStatus, readonly ContentLifecycleStatus[]>
> = {
  draft: ["evidence_pending", "review_pending", "archived"],
  evidence_pending: ["draft", "review_pending", "archived"],
  review_pending: ["draft", "evidence_pending", "approved", "archived"],
  approved: ["published", "review_pending", "archived"],
  published: ["suppressed", "archived"],
  suppressed: ["review_pending", "approved", "archived"],
  archived: ["draft"],
};

export function authorizeTransition(
  actor: AdminActor,
  kind: ContentEntityKind,
  from: ContentLifecycleStatus,
  to: ContentLifecycleStatus,
): Result<void, AppError> {
  if (!transitions[from].includes(to)) {
    return failure(
      appError("CONFLICT", `Transition ${from} → ${to} is not permitted.`),
    );
  }

  const founderOnly =
    (kind === "emergency_service" && (to === "published" || from === "suppressed")) ||
    (kind === "media_asset" && to === "published");

  if (founderOnly && actor.role !== "founder") {
    return failure(
      appError(
        "PERMISSION",
        "This safety-critical transition requires Founder authority.",
      ),
    );
  }

  if (to === "published" && from !== "approved") {
    return failure(appError("CONFLICT", "Only approved content can be published."));
  }

  return success(undefined);
}
