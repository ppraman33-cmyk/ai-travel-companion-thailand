import type { EntityId } from "@/domain/models";
import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

import type {
  AuditMutation,
  ContentEntityKind,
  ContentLifecycleStatus,
  ContentRecord,
} from "./types";

export interface ContentTransaction {
  find(
    kind: ContentEntityKind,
    id: EntityId,
  ): Promise<Result<ContentRecord | null, AppError>>;
  create(record: ContentRecord): Promise<Result<ContentRecord, AppError>>;
  update(record: ContentRecord): Promise<Result<ContentRecord, AppError>>;
  transition(
    kind: ContentEntityKind,
    id: EntityId,
    status: ContentLifecycleStatus,
  ): Promise<Result<ContentRecord, AppError>>;
  attachReference(
    kind: ContentEntityKind,
    id: EntityId,
    relation: "source" | "assertion" | "verification" | "translation" | "media",
    referenceId: EntityId,
  ): Promise<Result<void, AppError>>;
  appendAudit(event: AuditMutation): Promise<Result<void, AppError>>;
}

export interface ContentOperationsRepository {
  transaction<T>(
    operation: (transaction: ContentTransaction) => Promise<Result<T, AppError>>,
  ): Promise<Result<T, AppError>>;
}

export interface ContentQueueReader {
  getDashboard(): Promise<
    Result<
      Readonly<{
        draft: number;
        evidencePending: number;
        reviewPending: number;
        stale: number;
        suppressed: number;
        emergencyVerification: number;
        expiringLicenses: number;
        openReports: number;
      }>,
      AppError
    >
  >;
  listQueue(
    queue:
      | "draft"
      | "evidence_pending"
      | "review_pending"
      | "stale"
      | "suppressed"
      | "emergency_verification"
      | "expiring_licenses"
      | "reports",
    limit: number,
  ): Promise<Result<readonly ContentRecord[], AppError>>;
}
