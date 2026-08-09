import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

const state = vi.hoisted(() => ({
  saveItem: vi.fn(),
  saveTrip: vi.fn(),
  saveProfile: vi.fn(),
  findOwnedProfile: vi.fn(),
  setActiveProfile: vi.fn(),
  reorderItems: vi.fn(),
}));

vi.mock("@/server/runtime", () => ({
  runtime: {
    rateLimiter: { consume: () => success(undefined) },
    catalog: { list: vi.fn() },
    sessions: {
      authenticate: async () =>
        success({
          id: "70000000-0000-4000-8000-000000000001",
          locale: "en",
          expiresAt: "2099-01-01T00:00:00Z",
        }),
    },
    traveler: {
      saveItem: state.saveItem,
      saveTrip: state.saveTrip,
      saveProfile: state.saveProfile,
      findOwnedProfile: state.findOwnedProfile,
      setActiveProfile: state.setActiveProfile,
      reorderItems: state.reorderItems,
    },
  },
}));

import { POST } from "@/app/api/v1/[...resource]/route";

const request = (path: string, body: unknown) =>
  new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: "atct_session=opaque; atct_csrf=csrf",
      "x-csrf-token": "csrf",
    },
    body: JSON.stringify(body),
  });

const context = (resource: string[]) => ({ params: Promise.resolve({ resource }) });

describe("traveler itinerary route contracts", () => {
  beforeEach(() => {
    state.saveItem.mockReset().mockResolvedValue(
      success({
        id: "73000000-0000-4000-8000-000000000001",
        dayId: "72000000-0000-4000-8000-000000000001",
        order: 0,
        placeId: "74000000-0000-4000-8000-000000000001",
        plannedAt: "09:30",
        aiGenerated: false,
      }),
    );
    state.reorderItems.mockReset().mockResolvedValue(success([]));
    state.saveTrip.mockReset().mockResolvedValue(
      success({
        id: "71000000-0000-4000-8000-000000000001",
        sessionId: "70000000-0000-4000-8000-000000000001",
        title: "Owned trip",
        status: "draft",
      }),
    );
    state.saveProfile
      .mockReset()
      .mockImplementation(
        async (_sessionId: string, profile: Record<string, unknown>) =>
          success({ ...profile, sessionId: "70000000-0000-4000-8000-000000000001" }),
      );
    state.findOwnedProfile.mockReset().mockResolvedValue(
      success({
        id: "75000000-0000-4000-8000-000000000001",
        sessionId: "70000000-0000-4000-8000-000000000001",
        name: "Family holiday",
        transportation: "public_transit",
        travelStyle: "family",
        companions: "family",
        interests: ["food"],
        active: true,
      }),
    );
    state.setActiveProfile.mockReset().mockResolvedValue(success(undefined));
  });

  it("persists a valid wall-clock plannedAt through the canonical owned-Trip route", async () => {
    const response = await POST(
      request("/api/v1/trips/71000000-0000-4000-8000-000000000001/items", {
        dayId: "72000000-0000-4000-8000-000000000001",
        order: 0,
        placeId: "74000000-0000-4000-8000-000000000001",
        plannedAt: "09:30",
      }),
      context(["trips", "71000000-0000-4000-8000-000000000001", "items"]),
    );
    expect(response.status).toBe(201);
    expect(state.saveItem).toHaveBeenCalledWith(
      "70000000-0000-4000-8000-000000000001",
      "71000000-0000-4000-8000-000000000001",
      expect.objectContaining({ plannedAt: "09:30" }),
    );
  });

  it("rejects invalid plannedAt instead of stripping it", async () => {
    const response = await POST(
      request("/api/v1/trips/71000000-0000-4000-8000-000000000001/items", {
        dayId: "72000000-0000-4000-8000-000000000001",
        order: 0,
        placeId: "74000000-0000-4000-8000-000000000001",
        plannedAt: "25:90",
      }),
      context(["trips", "71000000-0000-4000-8000-000000000001", "items"]),
    );
    expect(response.status).toBe(400);
    expect(state.saveItem).not.toHaveBeenCalled();
  });

  it("keeps plannedAt optional without inventing a browser timezone", async () => {
    const response = await POST(
      request("/api/v1/trips/71000000-0000-4000-8000-000000000001/items", {
        dayId: "72000000-0000-4000-8000-000000000001",
        order: 0,
        placeId: "74000000-0000-4000-8000-000000000001",
      }),
      context(["trips", "71000000-0000-4000-8000-000000000001", "items"]),
    );
    expect(response.status).toBe(201);
    expect(state.saveItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.not.objectContaining({ plannedAt: expect.anything() }),
    );
  });

  it("uses the authenticated session for reorder and preserves safe ownership errors", async () => {
    state.reorderItems.mockResolvedValueOnce(
      failure(appError("NOT_FOUND", "Trip was not found.")),
    );
    const response = await POST(
      request(
        "/api/v1/trips/71000000-0000-4000-8000-000000000001/days/72000000-0000-4000-8000-000000000001/reorder",
        { orderedItemIds: ["73000000-0000-4000-8000-000000000001"] },
      ),
      context([
        "trips",
        "71000000-0000-4000-8000-000000000001",
        "days",
        "72000000-0000-4000-8000-000000000001",
        "reorder",
      ]),
    );
    expect(state.reorderItems).toHaveBeenCalledWith(
      "70000000-0000-4000-8000-000000000001",
      "71000000-0000-4000-8000-000000000001",
      "72000000-0000-4000-8000-000000000001",
      ["73000000-0000-4000-8000-000000000001"],
    );
    expect(response.status).toBe(404);
    expect((await response.json()).error.message).toBe("Trip was not found.");
  });

  it("does not accept a client-selected UUID when creating a Trip", async () => {
    const attackerId = "71000000-0000-4000-8000-000000000099";
    const response = await POST(
      request("/api/v1/trips", { id: attackerId, title: "New trip" }),
      context(["trips"]),
    );
    expect(response.status).toBe(201);
    expect(state.saveTrip).toHaveBeenCalledWith(
      "70000000-0000-4000-8000-000000000001",
      expect.objectContaining({ id: expect.not.stringMatching(attackerId) }),
    );
  });

  it("creates a profile with server-authenticated ownership and ignores client IDs", async () => {
    const response = await POST(
      request("/api/v1/profiles", {
        id: "75000000-0000-4000-8000-000000000099",
        sessionId: "70000000-0000-4000-8000-000000000099",
        name: "Road trip",
        transportation: "private_car",
        active: true,
      }),
      context(["profiles"]),
    );
    expect(response.status).toBe(201);
    expect(state.saveProfile).toHaveBeenCalledWith(
      "70000000-0000-4000-8000-000000000001",
      expect.objectContaining({
        id: expect.not.stringMatching(/000000000099$/),
        name: "Road trip",
      }),
    );
  });

  it("preserves omitted fields on profile PATCH and supports explicit preference reset", async () => {
    const profileId = "75000000-0000-4000-8000-000000000001";
    const response = await POST(
      request(`/api/v1/profiles/${profileId}`, {
        name: "Family in Thailand",
        transportation: null,
      }),
      context(["profiles", profileId]),
    );
    expect(response.status).toBe(200);
    expect(state.saveProfile).toHaveBeenCalledWith(
      "70000000-0000-4000-8000-000000000001",
      expect.objectContaining({
        name: "Family in Thailand",
        transportation: undefined,
        travelStyle: "family",
        companions: "family",
        interests: ["food"],
      }),
    );
  });

  it("rejects an empty profile update", async () => {
    const profileId = "75000000-0000-4000-8000-000000000001";
    const response = await POST(
      request(`/api/v1/profiles/${profileId}`, {}),
      context(["profiles", profileId]),
    );
    expect(response.status).toBe(400);
    expect(state.saveProfile).not.toHaveBeenCalled();
  });
});
