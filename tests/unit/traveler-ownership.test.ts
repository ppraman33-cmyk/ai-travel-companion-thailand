import { describe, expect, it, vi } from "vitest";

import {
  TravelerService,
  type TravelerItineraryDay,
  type TravelerItineraryItem,
  type TravelerRepository,
  type TravelerProfile,
  type TravelerTrip,
} from "@/application/public-api/traveler-service";
import { TravelerPersistenceAdapter } from "@/infrastructure/repositories/traveler-persistence-adapter";
import type {
  PersistenceClient,
  PersistenceQuery,
} from "@/infrastructure/supabase/persistence-client";
import { success } from "@/shared/result/result";

const ownTrip: TravelerTrip = {
  id: "71000000-0000-4000-8000-000000000001",
  sessionId: "70000000-0000-4000-8000-000000000001",
  title: "Own trip",
  status: "active",
};
const foreignTrip: TravelerTrip = {
  ...ownTrip,
  id: "71000000-0000-4000-8000-000000000002",
  sessionId: "70000000-0000-4000-8000-000000000002",
};

const repository = (overrides: Partial<TravelerRepository> = {}) =>
  ({
    listProfiles: vi.fn().mockResolvedValue(success([])),
    findProfile: vi.fn().mockResolvedValue(success(null)),
    saveProfile: vi.fn(),
    setActiveProfile: vi.fn(),
    deleteProfile: vi.fn(),
    listTrips: vi.fn().mockResolvedValue(success([])),
    findTrip: vi.fn().mockResolvedValue(success(null)),
    findDay: vi.fn().mockResolvedValue(success(null)),
    findItem: vi.fn().mockResolvedValue(success(null)),
    saveTrip: vi.fn(),
    deleteTrip: vi.fn(),
    listSaved: vi.fn(),
    savePlace: vi.fn(),
    deleteSaved: vi.fn(),
    createReport: vi.fn(),
    saveItem: vi.fn(),
    deleteItem: vi.fn(),
    listItems: vi.fn(),
    listDays: vi.fn(),
    saveDay: vi.fn(),
    reorderItems: vi.fn(),
    getPreferences: vi.fn(),
    savePreferences: vi.fn(),
    ...overrides,
  }) as TravelerRepository;

describe("service-role traveler ownership boundary", () => {
  const ownProfile: TravelerProfile = {
    id: "75000000-0000-4000-8000-000000000001",
    sessionId: ownTrip.sessionId,
    name: "Solo Thailand",
    interests: [],
    active: true,
    createdAt: "2030-01-01T00:00:00Z",
    updatedAt: "2030-01-01T00:00:00Z",
  };

  it("rejects a foreign or deleted profile when linking a Trip", async () => {
    const repo = repository({
      findTrip: vi.fn().mockResolvedValue(success(null)),
      findProfile: vi
        .fn()
        .mockResolvedValue(
          success({ ...ownProfile, sessionId: foreignTrip.sessionId }),
        ),
    });
    const result = await new TravelerService(repo).saveTrip(ownTrip.sessionId, {
      ...ownTrip,
      travelerProfileId: ownProfile.id,
    });
    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.saveTrip).not.toHaveBeenCalled();
  });

  it("changes the active profile without rewriting existing Trips", async () => {
    const repo = repository({
      findProfile: vi.fn().mockResolvedValue(success(ownProfile)),
      setActiveProfile: vi.fn().mockResolvedValue(success(ownProfile)),
    });
    const result = await new TravelerService(repo).setActiveProfile(
      ownTrip.sessionId,
      ownProfile.id,
    );
    expect(result).toMatchObject({ ok: true });
    expect(repo.saveTrip).not.toHaveBeenCalled();
  });

  it("persists a new active profile inactive before atomic activation", async () => {
    const persisted = { ...ownProfile, active: false };
    const repo = repository({
      findProfile: vi.fn().mockResolvedValue(success(null)),
      saveProfile: vi.fn().mockResolvedValue(success(persisted)),
      setActiveProfile: vi.fn().mockResolvedValue(success(ownProfile)),
    });
    const result = await new TravelerService(repo).saveProfile(ownTrip.sessionId, {
      id: ownProfile.id,
      name: ownProfile.name,
      interests: [],
      active: true,
    });
    expect(result).toMatchObject({ ok: true, value: { active: true } });
    expect(repo.saveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ active: false }),
    );
    expect(repo.setActiveProfile).toHaveBeenCalledWith(
      ownTrip.sessionId,
      ownProfile.id,
    );
  });

  it("does not restore a soft-deleted profile through the update operation", async () => {
    const repo = repository({
      findProfile: vi
        .fn()
        .mockResolvedValue(
          success({ ...ownProfile, deletedAt: "2030-01-02T00:00:00Z" }),
        ),
    });
    const result = await new TravelerService(repo).saveProfile(ownTrip.sessionId, {
      id: ownProfile.id,
      name: "Restore attempt",
      interests: [],
      active: false,
    });
    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.saveProfile).not.toHaveBeenCalled();
  });
  it("rejects a client UUID that already belongs to another session", async () => {
    const repo = repository({
      findTrip: vi.fn().mockResolvedValue(success(foreignTrip)),
    });
    const result = await new TravelerService(repo).saveTrip(ownTrip.sessionId, {
      ...ownTrip,
      title: "Attempted takeover",
    });
    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.saveTrip).not.toHaveBeenCalled();
  });

  it("rejects deleted Trips and foreign itinerary day IDs", async () => {
    const deleted = { ...ownTrip, status: "deleted" as const };
    const deletedRepo = repository({
      findTrip: vi.fn().mockResolvedValue(success(deleted)),
    });
    expect(
      await new TravelerService(deletedRepo).findOwnedTrip(
        ownTrip.sessionId,
        ownTrip.id,
      ),
    ).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });

    const foreignDay: TravelerItineraryDay = {
      id: "72000000-0000-4000-8000-000000000001",
      tripId: "71000000-0000-4000-8000-000000000002",
      plannedDate: "2030-01-01",
      dayOrder: 0,
    };
    const repo = repository({
      findTrip: vi.fn().mockResolvedValue(success(ownTrip)),
      findDay: vi.fn().mockResolvedValue(success(foreignDay)),
    });
    const result = await new TravelerService(repo).saveDay(ownTrip.sessionId, {
      ...foreignDay,
      tripId: ownTrip.id,
    });
    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.saveDay).not.toHaveBeenCalled();
  });

  it("rejects foreign itinerary item IDs and foreign Saved Trip context", async () => {
    const foreignItem: TravelerItineraryItem = {
      id: "73000000-0000-4000-8000-000000000001",
      dayId: "72000000-0000-4000-8000-000000000002",
      order: 0,
      placeId: "74000000-0000-4000-8000-000000000001",
      aiGenerated: false,
    };
    const repo = repository({
      findTrip: vi
        .fn()
        .mockResolvedValueOnce(success(ownTrip))
        .mockResolvedValueOnce(success(foreignTrip)),
      findItem: vi.fn().mockResolvedValue(success(foreignItem)),
      findDay: vi.fn().mockResolvedValue(
        success({
          id: foreignItem.dayId,
          tripId: foreignTrip.id,
          plannedDate: "2030-01-01",
          dayOrder: 0,
        }),
      ),
    });
    const service = new TravelerService(repo);
    const itemResult = await service.saveItem(
      ownTrip.sessionId,
      ownTrip.id,
      foreignItem,
    );
    expect(itemResult).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.saveItem).not.toHaveBeenCalled();

    const savedResult = await service.savePlace(
      ownTrip.sessionId,
      foreignItem.placeId!,
      foreignTrip.id,
    );
    expect(savedResult).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
    expect(repo.savePlace).not.toHaveBeenCalled();
  });

  it("prevents an accidental duplicate Place within one itinerary day", async () => {
    const item: TravelerItineraryItem = {
      id: "73000000-0000-4000-8000-000000000009",
      dayId: "72000000-0000-4000-8000-000000000001",
      order: 1,
      placeId: "74000000-0000-4000-8000-000000000001",
      aiGenerated: false,
    };
    const repo = repository({
      findTrip: vi.fn().mockResolvedValue(success(ownTrip)),
      findItem: vi.fn().mockResolvedValue(success(null)),
      listItems: vi
        .fn()
        .mockResolvedValue(
          success([{ ...item, id: "73000000-0000-4000-8000-000000000008" }]),
        ),
    });
    const result = await new TravelerService(repo).saveItem(
      ownTrip.sessionId,
      ownTrip.id,
      item,
    );
    expect(result).toMatchObject({ ok: false, error: { code: "CONFLICT" } });
    expect(repo.saveItem).not.toHaveBeenCalled();
  });
});

describe("plannedAt persistence mapping", () => {
  it("normalizes PostgreSQL time to the HH:mm API contract after reload", async () => {
    const client: PersistenceClient = {
      selectOne: async () => success(null),
      selectMany: async <Row>(query: PersistenceQuery) =>
        success(
          (query.table === "itinerary_days"
            ? [
                {
                  id: "day",
                  trip_id: "trip",
                  planned_date: "2030-01-01",
                  day_order: 0,
                  notes: null,
                },
              ]
            : [
                {
                  id: "item",
                  itinerary_day_id: "day",
                  item_order: 0,
                  place_id: "place",
                  event_occurrence_id: null,
                  notes: null,
                  planned_at: "09:30:00",
                  ai_generated: false,
                },
              ]) as Row[],
        ),
      upsert: async <Row>() => success({} as Row),
      deleteWhere: async () => success(undefined),
    };
    const result = await new TravelerPersistenceAdapter(client).listItems(
      "session",
      "trip",
    );
    expect(result).toMatchObject({
      ok: true,
      value: [expect.objectContaining({ plannedAt: "09:30" })],
    });
  });
});
