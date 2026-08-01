import { z } from "zod";

import type { AdminActor } from "@/application/content/types";
import { appError } from "@/shared/errors/app-error";
import { failure, type Result } from "@/shared/result/result";

const uuid = z.uuid();
const isoDateTime = z.iso.datetime({ offset: true });
const safeHttpsUrl = z.url({ protocol: /^https$/ });
const subjectKind = z.enum(["place", "food_specialty", "event", "emergency_service"]);
const supportedLocale = z.enum([
  "en",
  "th",
  "zh-CN",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "ru",
]);

export const adminEvidenceMutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create_source"),
    payload: z
      .object({
        sourceType: z.enum([
          "official",
          "licensed_dataset",
          "first_party",
          "document",
          "provider",
          "synthetic_test",
        ]),
        publisher: z.string().trim().min(1).max(240),
        title: z.string().trim().min(1).max(500),
        sourceUrl: safeHttpsUrl,
        retrievedAt: isoDateTime,
        ownershipStatus: z.enum([
          "owned",
          "licensed",
          "permission_granted",
          "unclear",
          "prohibited",
        ]),
        rightsStatus: z.enum([
          "pending",
          "approved",
          "restricted",
          "rejected",
          "expired",
        ]),
        verificationStatus: z.enum(["pending", "verified", "rejected"]),
        verifiedAt: isoDateTime.optional(),
        evidenceLocator: z.string().trim().min(1).max(1000),
        notes: z.string().trim().max(2000).optional(),
        dataClassification: z.enum(["real", "synthetic"]),
        license: z
          .object({
            name: z.string().trim().min(1).max(240),
            rightsHolder: z.string().trim().min(1).max(240),
            category: z.string().trim().min(1).max(120),
            termsUrl: safeHttpsUrl,
            commercialUsePermitted: z.boolean(),
            modificationPermitted: z.boolean(),
            storagePermitted: z.boolean(),
            redistributionPermitted: z.boolean(),
            attributionRequired: z.boolean(),
            attributionText: z.string().trim().max(1000).optional(),
            expiresAt: isoDateTime.optional(),
            approvalStatus: z.enum([
              "proposed",
              "approved",
              "rejected",
              "expired",
              "takedown",
            ]),
          })
          .refine(
            (license) =>
              !license.attributionRequired || Boolean(license.attributionText),
            "Attribution text is required.",
          ),
      })
      .refine(
        (value) => value.verificationStatus !== "verified" || Boolean(value.verifiedAt),
        "Verified sources require verifiedAt.",
      ),
  }),
  z.object({
    action: z.literal("create_assertion"),
    kind: subjectKind,
    id: uuid,
    payload: z.object({
      sourceId: uuid,
      fieldKey: z.string().trim().min(1).max(160),
      claimedValue: z.json(),
      confidence: z.number().min(0).max(1).optional(),
      observedAt: isoDateTime.optional(),
      effectiveFrom: isoDateTime.optional(),
      expiresAt: isoDateTime.optional(),
      recheckAt: isoDateTime.optional(),
      verificationStatus: z.enum(["pending", "verified", "rejected"]),
      notes: z.string().trim().max(2000).optional(),
    }),
  }),
  z.object({
    action: z.literal("create_translation"),
    kind: subjectKind,
    id: uuid,
    payload: z.object({
      locale: supportedLocale,
      sourceLocale: supportedLocale,
      name: z.string().trim().min(1).max(240),
      shortDescription: z.string().trim().max(1000).optional(),
      longDescription: z.string().trim().max(10000).optional(),
      instructions: z.string().trim().max(4000).optional(),
      warnings: z.string().trim().max(4000).optional(),
      accessibilityInformation: z.string().trim().max(4000).optional(),
      machineGenerated: z.boolean(),
      reviewStatus: z.enum(["draft", "machine_draft", "review_pending", "reviewed"]),
    }),
  }),
  z.object({
    action: z.literal("create_media"),
    kind: z.enum(["place", "emergency_service"]),
    id: uuid,
    payload: z.object({
      assetType: z.enum(["image", "icon", "illustration"]),
      storageKey: z
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9/_-]{1,500}$/),
      sourceId: uuid,
      licenseId: uuid,
      sourceUrl: safeHttpsUrl,
      creatorName: z.string().trim().min(1).max(240),
      rightsHolder: z.string().trim().min(1).max(240),
      licenseType: z.string().trim().min(1).max(120),
      licenseUrl: safeHttpsUrl,
      attribution: z.string().trim().min(1).max(1000),
      rightsStatus: z.enum([
        "approved",
        "pending",
        "restricted",
        "prohibited",
        "unclear",
      ]),
      verifiedAt: isoDateTime,
      depictsRealPlace: z.boolean(),
      aiGeneratedDecorative: z.boolean(),
      displayContext: z.enum([
        "category",
        "marketing",
        "atmospheric",
        "documentary_gallery",
      ]),
      dataClassification: z.literal("synthetic"),
    }),
  }),
  z.object({
    action: z.literal("create_verification"),
    kind: subjectKind,
    id: uuid,
    payload: z
      .object({
        assertionId: uuid,
        verificationType: z.string().trim().min(1).max(160),
        status: z.enum(["pending", "verified", "rejected"]),
        verifiedAt: isoDateTime.optional(),
        nextReviewAt: isoDateTime.optional(),
        staleAt: isoDateTime.optional(),
        notes: z.string().trim().max(2000).optional(),
      })
      .refine(
        (value) => value.status !== "verified" || Boolean(value.verifiedAt),
        "Verified records require verifiedAt.",
      ),
  }),
]);

export type AdminEvidenceMutation = z.infer<typeof adminEvidenceMutationSchema>;

export interface AdminEvidenceMutationRepository {
  mutate(
    command: AdminEvidenceMutation,
    correlationId: string,
  ): Promise<Result<unknown, ReturnType<typeof appError>>>;
}

export class AdminEvidenceMutationService {
  constructor(private readonly repository: AdminEvidenceMutationRepository) {}

  execute(actor: AdminActor, command: AdminEvidenceMutation, correlationId: string) {
    const founderOnly =
      command.action === "create_source" ||
      command.action === "create_media" ||
      ("kind" in command && command.kind === "emergency_service");
    if (founderOnly && actor.role !== "founder")
      return Promise.resolve(
        failure(
          appError("PERMISSION", "This evidence operation requires Founder authority."),
        ),
      );
    return this.repository.mutate(command, correlationId);
  }
}
