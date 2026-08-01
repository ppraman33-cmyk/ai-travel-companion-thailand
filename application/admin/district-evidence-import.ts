import { z } from "zod";

import type { AdminActor } from "@/application/content/types";
import { appError, type AppError } from "@/shared/errors/app-error";
import { failure, type Result } from "@/shared/result/result";

const districtBatchSchema = z
  .object({
    batchId: z.string().regex(/^chiang-mai-50\d{2}-v\d+$/),
    districtCode: z.string().regex(/^50(?:0[1-9]|1\d|2[0-5])$/),
    dataClassification: z.literal("real"),
    publicationStatus: z.literal("evidence-pending"),
    records: z
      .array(
        z.object({
          canonicalKey: z.string().trim().min(1).max(240),
          category: z.string().trim().min(1).max(80),
          sourceUrl: z.url({ protocol: /^https$/ }),
          sourceAssertion: z.string().trim().min(1).max(4000),
        }),
      )
      .min(1)
      .max(100),
  })
  .superRefine((batch, context) => {
    if (!batch.batchId.startsWith(`chiang-mai-${batch.districtCode}-`)) {
      context.addIssue({
        code: "custom",
        path: ["batchId"],
        message: "Batch key must match its single district.",
      });
    }
    if (
      new Set(batch.records.map((record) => record.canonicalKey)).size !==
      batch.records.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["records"],
        message: "Canonical keys must be unique within a district batch.",
      });
    }
  });

export type DistrictEvidenceBatch = z.infer<typeof districtBatchSchema>;

export interface AuditedDistrictImportPort {
  importDistrictBatch(
    batch: DistrictEvidenceBatch,
    correlationId: string,
  ): Promise<
    Result<{ readonly imported: number; readonly replayed: boolean }, AppError>
  >;
}

export class DistrictEvidenceImportService {
  constructor(private readonly port: AuditedDistrictImportPort) {}

  execute(actor: AdminActor, candidate: unknown, correlationId: string) {
    if (actor.role !== "founder") {
      return Promise.resolve(
        failure(
          appError(
            "PERMISSION",
            "District evidence import requires Founder authority.",
          ),
        ),
      );
    }
    const parsed = districtBatchSchema.safeParse(candidate);
    if (!parsed.success) {
      return Promise.resolve(
        failure(appError("VALIDATION", "District evidence batch is invalid.")),
      );
    }
    if (!correlationId) {
      return Promise.resolve(
        failure(appError("VALIDATION", "A server correlation ID is required.")),
      );
    }
    return this.port.importDistrictBatch(parsed.data, correlationId);
  }
}

export { districtBatchSchema };
