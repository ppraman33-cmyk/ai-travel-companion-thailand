import type { ContentQueueReader } from "@/application/content/ports";
import type { ContentOperationsService } from "@/application/content/content-operations-service";
import type {
  AdminActor,
  ContentEntityKind,
  ContentLifecycleStatus,
  ContentRecord,
} from "@/application/content/types";

export class AdminOperationsService {
  constructor(
    private readonly queues: ContentQueueReader,
    private readonly content: ContentOperationsService,
  ) {}

  getDashboard() {
    return this.queues.getDashboard();
  }

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
    limit = 25,
  ) {
    return this.queues.listQueue(queue, Math.min(Math.max(limit, 1), 100));
  }

  createDraft(actor: AdminActor, record: Omit<ContentRecord, "status">) {
    return this.content.createDraft(actor, record);
  }

  createDraftBatch(
    actor: AdminActor,
    records: readonly Omit<ContentRecord, "status">[],
  ) {
    return this.content.createDraftBatch(actor, records);
  }

  updateDraft(actor: AdminActor, record: ContentRecord) {
    return this.content.updateDraft(actor, record);
  }

  transition(
    actor: AdminActor,
    kind: ContentEntityKind,
    id: string,
    target: ContentLifecycleStatus,
  ) {
    return this.content.transition(actor, kind, id, target);
  }

  evaluate(record: ContentRecord) {
    return this.content.evaluate(record);
  }
}
