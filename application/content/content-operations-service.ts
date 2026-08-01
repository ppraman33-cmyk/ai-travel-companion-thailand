import type { EntityId } from "@/domain/models";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

import { authorizeTransition } from "./lifecycle";
import type { ContentOperationsRepository } from "./ports";
import { PublicationEligibilityService } from "./publication-eligibility";
import type {
  AdminActor,
  ContentEntityKind,
  ContentLifecycleStatus,
  ContentRecord,
  PublicationEligibility,
} from "./types";

export class ContentOperationsService {
  constructor(
    private readonly repository: ContentOperationsRepository,
    private readonly eligibility: PublicationEligibilityService,
    private readonly createCorrelationId: () => string,
  ) {}

  createDraft(actor: AdminActor, record: Omit<ContentRecord, "status">) {
    return this.repository.transaction(async (transaction) => {
      const created = await transaction.create({ ...record, status: "draft" });
      if (!created.ok) return created;
      const audit = await transaction.appendAudit(
        this.audit(actor, created.value, "content.draft_created"),
      );
      return audit.ok ? created : audit;
    });
  }

  createDraftBatch(
    actor: AdminActor,
    records: readonly Omit<ContentRecord, "status">[],
  ) {
    if (records.length === 0 || records.length > 100) {
      return Promise.resolve(
        failure(
          appError("VALIDATION", "A bulk draft batch must contain 1–100 records."),
        ),
      );
    }
    return this.repository.transaction(async (transaction) => {
      const created: ContentRecord[] = [];
      for (const record of records) {
        const result = await transaction.create({ ...record, status: "draft" });
        if (!result.ok) return result;
        const audit = await transaction.appendAudit(
          this.audit(actor, result.value, "content.bulk_draft_created", {
            batchSize: records.length,
          }),
        );
        if (!audit.ok) return audit;
        created.push(result.value);
      }
      return success(created);
    });
  }

  updateDraft(actor: AdminActor, record: ContentRecord) {
    if (!["draft", "evidence_pending", "review_pending"].includes(record.status)) {
      return Promise.resolve(
        failure(appError("CONFLICT", "Only editable workflow states can be updated.")),
      );
    }
    return this.repository.transaction(async (transaction) => {
      const updated = await transaction.update(record);
      if (!updated.ok) return updated;
      const audit = await transaction.appendAudit(
        this.audit(actor, updated.value, "content.updated"),
      );
      return audit.ok ? updated : audit;
    });
  }

  attach(
    actor: AdminActor,
    kind: ContentEntityKind,
    id: EntityId,
    relation: "source" | "assertion" | "verification" | "translation" | "media",
    referenceId: EntityId,
  ) {
    return this.repository.transaction(async (transaction) => {
      const current = await transaction.find(kind, id);
      if (!current.ok) return current;
      if (!current.value) {
        return failure(appError("NOT_FOUND", "Content record was not found."));
      }
      const attached = await transaction.attachReference(
        kind,
        id,
        relation,
        referenceId,
      );
      if (!attached.ok) return attached;
      const audit = await transaction.appendAudit(
        this.audit(actor, current.value, `content.${relation}_attached`, {
          referenceId,
        }),
      );
      return audit.ok ? success(undefined) : audit;
    });
  }

  evaluate(record: ContentRecord): PublicationEligibility {
    return this.eligibility.evaluate(record);
  }

  transition(
    actor: AdminActor,
    kind: ContentEntityKind,
    id: EntityId,
    target: ContentLifecycleStatus,
  ): Promise<Result<ContentRecord, AppError>> {
    return this.repository.transaction(async (transaction) => {
      const current = await transaction.find(kind, id);
      if (!current.ok) return current;
      if (!current.value) {
        return failure(appError("NOT_FOUND", "Content record was not found."));
      }
      const authorized = authorizeTransition(actor, kind, current.value.status, target);
      if (!authorized.ok) return authorized;

      if (target === "published") {
        const eligibility = this.eligibility.evaluate(current.value);
        if (!eligibility.eligible) {
          return failure(
            appError(
              "VALIDATION",
              "Publication eligibility requirements are not met.",
              {
                metadata: { reasons: eligibility.reasons },
              },
            ),
          );
        }
      }

      const transitioned = await transaction.transition(kind, id, target);
      if (!transitioned.ok) return transitioned;
      const audit = await transaction.appendAudit(
        this.audit(actor, transitioned.value, `content.${target}`, {
          previousStatus: current.value.status,
        }),
      );
      return audit.ok ? transitioned : audit;
    });
  }

  detectStale(records: readonly ContentRecord[], now = new Date()) {
    return records.filter(
      (record) => record.staleAt && new Date(record.staleAt).getTime() <= now.getTime(),
    );
  }

  private audit(
    actor: AdminActor,
    record: ContentRecord,
    action: string,
    metadata: Readonly<Record<string, string | number | boolean | null>> = {},
  ) {
    return {
      actorId: actor.id,
      action,
      entityKind: record.kind,
      entityId: record.id,
      correlationId: this.createCorrelationId(),
      safeMetadata: {
        status: record.status,
        classification: record.dataClassification,
        ...metadata,
      },
    };
  }
}
