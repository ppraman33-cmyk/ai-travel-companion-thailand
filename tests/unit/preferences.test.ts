import { describe, expect, it } from "vitest";

import {
  hasPreferences,
  preferenceLabels,
  recommendedCategories,
  summarizePreferences,
  type TravelerPreferences,
} from "@/application/traveler/preferences";

describe("Traveler preferences logic", () => {
  it("summarizes known preference values into human-readable labels", () => {
    const prefs: TravelerPreferences = {
      transportation: "public_transit",
      travelStyle: "cultural",
      companions: "solo",
    };
    const summary = summarizePreferences(prefs);
    expect(summary).toContain("Public transit");
    expect(summary).toContain("Cultural & historical");
    expect(summary).toContain("Solo traveler");
  });

  it("passes through unknown preference values as-is", () => {
    const summary = summarizePreferences({ transportation: "teleport" });
    expect(summary).toEqual(["teleport"]);
  });

  it("returns empty summary for no preferences", () => {
    expect(summarizePreferences({})).toEqual([]);
  });

  it("detects when preferences are present", () => {
    expect(hasPreferences({ transportation: "walking" })).toBe(true);
    expect(hasPreferences({})).toBe(false);
  });

  it("maps travel styles to recommended categories deterministically", () => {
    expect(recommendedCategories({ travelStyle: "food" })).toEqual(["restaurants", "foods"]);
    expect(recommendedCategories({ travelStyle: "cultural" })).toEqual(["attractions", "foods", "events"]);
    expect(recommendedCategories({ travelStyle: "nature" })).toEqual(["attractions"]);
    expect(recommendedCategories({})).toEqual([]);
  });

  it("maps every option value to a label", () => {
    for (const label of Object.values(preferenceLabels)) {
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
