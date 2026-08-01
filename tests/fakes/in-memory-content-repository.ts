import type {
  ContentOperationsRepository,
  ContentTransaction,
} from "@/application/content/ports";
import type {
  AuditMutation,
  ContentEntityKind,
  ContentLifecycleStatus,
  ContentRecord,
} from "@/application/content/types";
import type { AppError } from "@/shared/errors/app-error";
import { success, type Result } from "@/shared/result/result";

const keyOf = (kind: ContentEntityKind, id: string) => `${kind}:${id}`;

export class InMemoryContentOperationsRepository implements ContentOperationsRepository {
  records: Map<string, ContentRecord>;
  audits: AuditMutation[] = [];
  failAudit = false;

  constructor(initial: readonly ContentRecord[] = []) {
    this.records = new Map(
      initial.map((record) => [keyOf(record.kind, record.id), record]),
    );
  }

  async transaction<T>(
    operation: (transaction: ContentTransaction) => Promise<Result<T, AppError>>,
  ): Promise<Result<T, AppError>> {
    const recordsBefore = new Map(this.records);
    const auditsBefore = [...this.audits];
    const result = await operation({
      find: async (kind, id) => success(this.records.get(keyOf(kind, id)) ?? null),
      create: async (record) => {
        this.records.set(keyOf(record.kind, record.id), record);
        return success(record);
      },
      update: async (record) => {
        this.records.set(keyOf(record.kind, record.id), record);
        return success(record);
      },
      transition: async (kind, id, status: ContentLifecycleStatus) => {
        const current = this.records.get(keyOf(kind, id))!;
        const updated = { ...current, status };
        this.records.set(keyOf(kind, id), updated);
        return success(updated);
      },
      attachReference: async () => success(undefined),
      appendAudit: async (event) => {
        if (this.failAudit) {
          return {
            ok: false,
            error: {
              code: "UNAVAILABLE",
              message: "Synthetic audit failure",
              retryable: false,
            },
          };
        }
        this.audits.push(event);
        return success(undefined);
      },
    });
    if (!result.ok) {
      this.records = recordsBefore;
      this.audits = auditsBefore;
    }
    return result;
  }
}
