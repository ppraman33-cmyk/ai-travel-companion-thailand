import { describe, expect, it } from "vitest";

import { ExternalMapHandoffProvider } from "@/infrastructure/maps/external-map-handoff-provider";

const provider = new ExternalMapHandoffProvider();
const destination = { latitude: 18.7883, longitude: 98.9853 };

describe("ExternalMapHandoffProvider", () => {
  it("generates an encoded Google Maps directions URL without a key", () => {
    const result = provider.createExternalHandoffUrl({
      application: "google_maps",
      action: "directions",
      placeId: "synthetic-place",
      destination,
      destinationLabel: "ทดสอบ & Test",
    });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.hostname).toBe("www.google.com");
    expect(result.ok && result.value.searchParams.get("destination")).toBe(
      "18.7883,98.9853",
    );
    expect(result.ok && result.value.searchParams.has("key")).toBe(false);
  });

  it("generates an Apple Maps view URL with a safely encoded label", () => {
    const result = provider.createExternalHandoffUrl({
      application: "apple_maps",
      action: "view",
      placeId: "synthetic-place",
      destination,
      destinationLabel: "Test Place & Garden",
    });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.hostname).toBe("maps.apple.com");
    expect(result.ok && result.value.searchParams.get("q")).toBe("Test Place & Garden");
  });

  it("does not create links for invalid coordinates", () => {
    const result = provider.createExternalHandoffUrl({
      application: "google_maps",
      action: "view",
      placeId: "synthetic-place",
      destination: { latitude: 200, longitude: 98 },
      destinationLabel: "Invalid",
    });
    expect(!result.ok && result.error.code).toBe("VALIDATION");
  });
});
