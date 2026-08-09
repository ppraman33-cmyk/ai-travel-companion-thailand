import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { PublicCatalogKind } from "@/application/public-api/contracts";
import { appError } from "@/shared/errors/app-error";
import { correlationId, errorResponse, okResponse } from "@/server/api-response";
import {
  csrfCookieName,
  mutationIsAllowed,
  sessionCookieName,
} from "@/server/http-security";
import { runtime as appRuntime } from "@/server/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  destination: z.uuid().optional(),
  category: z.string().trim().min(1).max(80).optional(),
  locale: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)
    .default("en"),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  from: z.iso.datetime().optional(),
  until: z.iso.datetime().optional(),
  q: z.string().trim().min(2).max(100).optional(),
  district: z.uuid().optional(),
});

const sessionSchema = z.object({
  locale: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)
    .default("en"),
});
const tripSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    status: z.enum(["draft", "active", "completed"]).default("draft"),
    startDate: z.string().trim().max(10).optional(),
    endDate: z.string().trim().max(10).optional(),
    notes: z.string().trim().max(5000).optional(),
    destination: z.string().trim().min(1).max(160).optional(),
    travelerProfileId: z.uuid().nullable().optional(),
  })
  .refine(
    (value) => !value.startDate || !value.endDate || value.endDate >= value.startDate,
    { message: "Trip end date must not be before its start date." },
  );
const profileInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  transportation: z
    .enum([
      "public_transit",
      "private_car",
      "motorcycle",
      "bicycle",
      "walking",
      "mixed",
    ])
    .nullable()
    .optional(),
  travelStyle: z
    .enum([
      "budget",
      "relaxation",
      "adventure",
      "cultural",
      "food",
      "nature",
      "family",
      "mixed",
    ])
    .nullable()
    .optional(),
  companions: z
    .enum(["solo", "couple", "friends", "family", "children", "older_adults", "group"])
    .nullable()
    .optional(),
  activityLevel: z.enum(["low", "moderate", "high", "very_high"]).nullable().optional(),
  mobilityNeeds: z.string().trim().max(300).nullable().optional(),
  budget: z.enum(["budget", "mid_range", "luxury", "mixed"]).nullable().optional(),
  interests: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  active: z.boolean().optional(),
});
const profileCreateSchema = profileInputSchema.extend({
  interests: profileInputSchema.shape.interests.default([]),
  active: profileInputSchema.shape.active.default(false),
});
const profileUpdateSchema = profileInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required.",
  });
const profileDeleteSchema = z
  .object({
    action: z.enum(["block", "reassign", "detach"]).default("block"),
    replacementProfileId: z.uuid().optional(),
  })
  .refine(
    (value) => value.action !== "reassign" || Boolean(value.replacementProfileId),
    {
      message: "A replacement profile is required.",
    },
  );
const savedSchema = z.object({
  placeId: z.uuid(),
  tripId: z.uuid().optional(),
});
const reportSchema = z.object({
  placeId: z.uuid(),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(4000),
});
const itemSchema = z
  .object({
    dayId: z.uuid(),
    order: z.number().int().min(0).max(100),
    placeId: z.uuid().optional(),
    eventOccurrenceId: z.uuid().optional(),
    notes: z.string().trim().max(1000).optional(),
    // Local wall-clock time in the Trip timezone (Asia/Bangkok for MVP).
    plannedAt: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      .optional(),
    aiGenerated: z.boolean().default(false),
  })
  .refine((value) => Boolean(value.placeId) !== Boolean(value.eventOccurrenceId), {
    message: "Exactly one itinerary target is required.",
  });
const daySchema = z.object({
  plannedDate: z.string().trim().min(1).max(10),
  dayOrder: z.number().int().min(0).max(100),
  notes: z.string().trim().max(2000).optional(),
});
const reorderSchema = z.object({
  orderedItemIds: z.array(z.uuid()).min(1).max(100),
});
const preferencesSchema = z.object({
  transportation: z.string().trim().max(80).optional(),
  travelStyle: z.string().trim().max(80).optional(),
  companions: z.string().trim().max(80).optional(),
  activityLevel: z.string().trim().max(80).optional(),
  budget: z.string().trim().max(80).optional(),
  language: z.string().trim().max(20).optional(),
});

const catalogKinds = new Set<PublicCatalogKind>([
  "destinations",
  "places",
  "restaurants",
  "attractions",
  "foods",
  "events",
  "event-occurrences",
  "emergency-services",
  "search",
]);

type RouteContext = { params: Promise<{ resource: string[] }> };

const requestKey = (request: NextRequest) =>
  request.cookies.get(sessionCookieName)?.value.slice(0, 12) ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "anonymous";

const parseBody = async (request: NextRequest) => {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 65_536) return undefined;
  try {
    return await request.json();
  } catch {
    return undefined;
  }
};

export async function GET(request: NextRequest, context: RouteContext) {
  const requestId = correlationId();
  const { resource } = await context.params;
  const [area, id, nested] = resource;
  const rate = appRuntime.rateLimiter.consume(`read:${requestKey(request)}`, 120, 60);
  if (!rate.ok) return errorResponse(rate.error, requestId);

  if (area && catalogKinds.has(area as PublicCatalogKind)) {
    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      return errorResponse(appError("VALIDATION", "Invalid catalog query."), requestId);
    }
    const result = await appRuntime.catalog.list({
      kind: area as PublicCatalogKind,
      id,
      destinationId: parsed.data.destination,
      category: parsed.data.category,
      locale: parsed.data.locale,
      cursor: parsed.data.cursor,
      limit: parsed.data.limit,
      activeFrom: parsed.data.from,
      activeUntil: parsed.data.until,
      keyword: parsed.data.q,
      districtId: parsed.data.district,
    });
    return result.ok
      ? okResponse(result.value, requestId)
      : errorResponse(result.error, requestId);
  }

  const authenticated = appRuntime.sessions
    ? await appRuntime.sessions.authenticate(
        request.cookies.get(sessionCookieName)?.value,
      )
    : null;
  if (!authenticated?.ok) {
    return errorResponse(
      authenticated?.error ??
        appError("UNAVAILABLE", "Session persistence is unavailable."),
      requestId,
    );
  }

  if (area === "trips" && appRuntime.traveler) {
    if (id && nested === "items") {
      const result = await appRuntime.traveler.listItems(authenticated.value.id, id);
      return result.ok
        ? okResponse(result.value, requestId)
        : errorResponse(result.error, requestId);
    }
    if (id && nested === "days") {
      const result = await appRuntime.traveler.listDays(authenticated.value.id, id);
      return result.ok
        ? okResponse(result.value, requestId)
        : errorResponse(result.error, requestId);
    }
    const result = id
      ? await appRuntime.traveler.findOwnedTrip(authenticated.value.id, id)
      : await appRuntime.traveler.listTrips(authenticated.value.id);
    return result.ok
      ? okResponse(result.value, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "profiles" && appRuntime.traveler) {
    const result = id
      ? await appRuntime.traveler.findOwnedProfile(authenticated.value.id, id)
      : await appRuntime.traveler.listProfiles(authenticated.value.id);
    return result.ok
      ? okResponse(result.value, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "preferences" && appRuntime.traveler) {
    const result = await appRuntime.traveler.getPreferences(authenticated.value.id);
    return result.ok
      ? okResponse(result.value, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "saved-places" && appRuntime.traveler) {
    const result = await appRuntime.traveler.listSaved(authenticated.value.id);
    return result.ok
      ? okResponse(result.value, requestId)
      : errorResponse(result.error, requestId);
  }
  return errorResponse(appError("NOT_FOUND", "API endpoint was not found."), requestId);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const requestId = correlationId();
  const { resource } = await context.params;
  const [area, resourceId, nested, nestedId] = resource;
  const rate = appRuntime.rateLimiter.consume(`write:${requestKey(request)}`, 30, 60);
  if (!rate.ok) return errorResponse(rate.error, requestId);

  if (area === "sessions") {
    if (!appRuntime.sessions) {
      return errorResponse(
        appError("UNAVAILABLE", "Session persistence is unavailable."),
        requestId,
      );
    }
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return errorResponse(
        appError("PERMISSION", "Request origin is not allowed."),
        requestId,
      );
    }
    const parsed = sessionSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid session request."),
        requestId,
      );
    }
    const issued = await appRuntime.sessions.issue(parsed.data.locale);
    if (!issued.ok) return errorResponse(issued.error, requestId);
    const response = okResponse({ expiresAt: issued.value.expiresAt }, requestId, 201);
    const secure = process.env.NEXT_PUBLIC_APP_ENV === "production";
    response.cookies.set(sessionCookieName, issued.value.secret, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      expires: new Date(issued.value.expiresAt),
    });
    response.cookies.set(csrfCookieName, issued.value.csrfToken, {
      httpOnly: false,
      secure,
      sameSite: "strict",
      path: "/",
      expires: new Date(issued.value.expiresAt),
    });
    return response;
  }

  if (area === "assistant") {
    return errorResponse(
      appError(
        "UNAVAILABLE",
        "AI assistance is disabled until an approved provider is configured.",
      ),
      requestId,
    );
  }

  if (!mutationIsAllowed(request)) {
    return errorResponse(appError("PERMISSION", "CSRF validation failed."), requestId);
  }
  if (!appRuntime.sessions || !appRuntime.traveler) {
    return errorResponse(
      appError("UNAVAILABLE", "Traveler persistence is unavailable."),
      requestId,
    );
  }
  const authenticated = await appRuntime.sessions.authenticate(
    request.cookies.get(sessionCookieName)?.value,
  );
  if (!authenticated.ok) return errorResponse(authenticated.error, requestId);

  if (area === "trips" && resourceId && nested === "items" && resource.length <= 4) {
    const parsed = itemSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid itinerary item request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.saveItem(
      authenticated.value.id,
      resourceId,
      {
        ...parsed.data,
        id: nestedId ?? randomUUID(),
      },
    );
    return result.ok
      ? okResponse(result.value, requestId, nestedId ? 200 : 201)
      : errorResponse(result.error, requestId);
  }

  if (area === "trips" && resourceId && nested === "days" && nestedId) {
    const action = resource[4];
    if (action === "reorder") {
      const parsed = reorderSchema.safeParse(await parseBody(request));
      if (!parsed.success) {
        return errorResponse(
          appError("VALIDATION", "Invalid itinerary reorder request."),
          requestId,
        );
      }
      const result = await appRuntime.traveler.reorderItems(
        authenticated.value.id,
        resourceId,
        nestedId,
        parsed.data.orderedItemIds,
      );
      return result.ok
        ? okResponse(result.value, requestId)
        : errorResponse(result.error, requestId);
    }
  }

  if (area === "trips" && resourceId && nested === "days" && !nestedId) {
    const parsed = daySchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid itinerary day request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.saveDay(authenticated.value.id, {
      id: randomUUID(),
      tripId: resourceId,
      plannedDate: parsed.data.plannedDate,
      dayOrder: parsed.data.dayOrder,
      notes: parsed.data.notes,
    });
    return result.ok
      ? okResponse(result.value, requestId, 201)
      : errorResponse(result.error, requestId);
  }
  if (area === "trips" && !nested) {
    const parsed = tripSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(appError("VALIDATION", "Invalid Trip request."), requestId);
    }
    const existing = resourceId
      ? await appRuntime.traveler.findOwnedTrip(authenticated.value.id, resourceId)
      : null;
    if (existing && (!existing.ok || !existing.value)) {
      return existing.ok
        ? errorResponse(appError("NOT_FOUND", "Trip was not found."), requestId)
        : errorResponse(existing.error, requestId);
    }
    const result = await appRuntime.traveler.saveTrip(authenticated.value.id, {
      id: resourceId ?? randomUUID(),
      title: parsed.data.title,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      notes: parsed.data.notes,
      destination: parsed.data.destination,
      timezone: "Asia/Bangkok",
      travelerProfileId:
        parsed.data.travelerProfileId === null
          ? undefined
          : (parsed.data.travelerProfileId ?? existing?.value?.travelerProfileId),
    });
    return result.ok
      ? okResponse(result.value, requestId, resourceId ? 200 : 201)
      : errorResponse(result.error, requestId);
  }
  if (area === "profiles" && appRuntime.traveler) {
    if (resourceId && nested === "activate") {
      const result = await appRuntime.traveler.setActiveProfile(
        authenticated.value.id,
        resourceId,
      );
      return result.ok
        ? okResponse(result.value, requestId)
        : errorResponse(result.error, requestId);
    }
    const parsed = (resourceId ? profileUpdateSchema : profileCreateSchema).safeParse(
      await parseBody(request),
    );
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid travel profile request."),
        requestId,
      );
    }
    const existing = resourceId
      ? await appRuntime.traveler.findOwnedProfile(authenticated.value.id, resourceId)
      : null;
    if (existing && (!existing.ok || !existing.value)) {
      return existing.ok
        ? errorResponse(
            appError("NOT_FOUND", "Travel profile was not found."),
            requestId,
          )
        : errorResponse(existing.error, requestId);
    }
    const result = await appRuntime.traveler.saveProfile(authenticated.value.id, {
      id: resourceId ?? randomUUID(),
      name: parsed.data.name ?? existing?.value?.name ?? "",
      description:
        "description" in parsed.data
          ? (parsed.data.description ?? undefined)
          : existing?.value?.description,
      transportation:
        "transportation" in parsed.data
          ? (parsed.data.transportation ?? undefined)
          : existing?.value?.transportation,
      travelStyle:
        "travelStyle" in parsed.data
          ? (parsed.data.travelStyle ?? undefined)
          : existing?.value?.travelStyle,
      companions:
        "companions" in parsed.data
          ? (parsed.data.companions ?? undefined)
          : existing?.value?.companions,
      activityLevel:
        "activityLevel" in parsed.data
          ? (parsed.data.activityLevel ?? undefined)
          : existing?.value?.activityLevel,
      mobilityNeeds:
        "mobilityNeeds" in parsed.data
          ? (parsed.data.mobilityNeeds ?? undefined)
          : existing?.value?.mobilityNeeds,
      budget:
        "budget" in parsed.data
          ? (parsed.data.budget ?? undefined)
          : existing?.value?.budget,
      interests: parsed.data.interests ?? existing?.value?.interests ?? [],
      active: parsed.data.active ?? existing?.value?.active ?? false,
    });
    return result.ok
      ? okResponse(result.value, requestId, resourceId ? 200 : 201)
      : errorResponse(result.error, requestId);
  }
  if (area === "preferences" && appRuntime.traveler) {
    const parsed = preferencesSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid preferences request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.savePreferences(
      authenticated.value.id,
      parsed.data,
    );
    return result.ok
      ? okResponse(result.value, requestId, 200)
      : errorResponse(result.error, requestId);
  }
  if (area === "saved-places") {
    const parsed = savedSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid saved Place request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.savePlace(
      authenticated.value.id,
      parsed.data.placeId,
      parsed.data.tripId,
    );
    return result.ok
      ? okResponse({ saved: true }, requestId, 201)
      : errorResponse(result.error, requestId);
  }
  if (area === "reports") {
    const parsed = reportSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid report request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.createReport(authenticated.value.id, {
      id: randomUUID(),
      ...parsed.data,
    });
    return result.ok
      ? okResponse({ received: true }, requestId, 201)
      : errorResponse(result.error, requestId);
  }
  return errorResponse(appError("NOT_FOUND", "API endpoint was not found."), requestId);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return POST(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const requestId = correlationId();
  if (!mutationIsAllowed(request)) {
    return errorResponse(appError("PERMISSION", "CSRF validation failed."), requestId);
  }
  const { resource } = await context.params;
  const [area, id, nested, nestedId] = resource;
  if (!appRuntime.sessions) {
    return errorResponse(
      appError("UNAVAILABLE", "Session persistence is unavailable."),
      requestId,
    );
  }
  const secret = request.cookies.get(sessionCookieName)?.value;
  if (area === "sessions" && id === "current") {
    const revoked = await appRuntime.sessions.revoke(secret);
    const response = revoked.ok
      ? okResponse({ revoked: true }, requestId)
      : errorResponse(revoked.error, requestId);
    if (revoked.ok) {
      response.cookies.delete(sessionCookieName);
      response.cookies.delete(csrfCookieName);
    }
    return response;
  }
  const authenticated = await appRuntime.sessions.authenticate(secret);
  if (!authenticated.ok) return errorResponse(authenticated.error, requestId);
  if (area === "profiles" && id && appRuntime.traveler) {
    const parsed = profileDeleteSchema.safeParse(await parseBody(request));
    if (!parsed.success) {
      return errorResponse(
        appError("VALIDATION", "Invalid profile deletion request."),
        requestId,
      );
    }
    const result = await appRuntime.traveler.deleteProfile(
      authenticated.value.id,
      id,
      parsed.data.action,
      parsed.data.replacementProfileId,
    );
    return result.ok
      ? okResponse({ deleted: true }, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "trips" && id && nested === "items" && nestedId && appRuntime.traveler) {
    const result = await appRuntime.traveler.deleteItem(
      authenticated.value.id,
      id,
      nestedId,
    );
    return result.ok
      ? okResponse({ deleted: true }, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "trips" && id && appRuntime.traveler) {
    const result = await appRuntime.traveler.deleteTrip(authenticated.value.id, id);
    return result.ok
      ? okResponse({ deleted: true }, requestId)
      : errorResponse(result.error, requestId);
  }
  if (area === "saved-places" && id && appRuntime.traveler) {
    const result = await appRuntime.traveler.deleteSaved(authenticated.value.id, id);
    return result.ok
      ? okResponse({ deleted: true }, requestId)
      : errorResponse(result.error, requestId);
  }
  return NextResponse.json(
    {
      data: null,
      error: {
        code: "NOT_FOUND",
        message: "API endpoint was not found.",
        retryable: false,
      },
      meta: { requestId },
    },
    { status: 404 },
  );
}
