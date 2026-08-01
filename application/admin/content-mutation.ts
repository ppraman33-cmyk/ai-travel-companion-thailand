import { z } from "zod";

const uuid = z.uuid();
const kind = z.enum(["place", "food_specialty", "event", "emergency_service"]);

export const adminContentMutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("transition"),
    kind,
    id: uuid,
    target: z.enum([
      "draft",
      "evidence_pending",
      "review_pending",
      "approved",
      "published",
      "suppressed",
      "archived",
    ]),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.enum([
      "attach_assertion",
      "attach_translation",
      "attach_media",
      "attach_verification",
    ]),
    kind,
    id: uuid,
    referenceId: uuid,
  }),
  z.object({
    action: z.literal("create_place_draft"),
    payload: z.object({
      destinationId: uuid,
      geographyId: uuid,
      canonicalThaiName: z.string().trim().min(1).max(240),
      defaultEnglishName: z.string().trim().max(240).optional(),
      normalizedSearchName: z.string().trim().min(1).max(240),
      addressSummary: z.string().trim().min(1).max(1000),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      placeCategory: z.enum([
        "restaurant",
        "attraction",
        "emergency_service",
        "market",
        "walking_street",
        "other",
      ]),
      // Real-world intake must use a future atomic provenance workflow. This
      // foundation endpoint cannot create an orphaned real record.
      dataClassification: z.literal("synthetic"),
    }),
  }),
  z.object({
    action: z.literal("update_place_draft"),
    id: uuid,
    payload: z
      .object({
        canonicalThaiName: z.string().trim().min(1).max(240).optional(),
        defaultEnglishName: z.string().trim().max(240).nullable().optional(),
        addressSummary: z.string().trim().min(1).max(1000).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
      .refine((value) => Object.keys(value).length > 0),
  }),
]);

export type AdminContentMutation = z.infer<typeof adminContentMutationSchema>;
