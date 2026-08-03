export interface TravelerPreferences {
  readonly transportation?: string;
  readonly travelStyle?: string;
  readonly companions?: string;
  readonly activityLevel?: string;
  readonly budget?: string;
  readonly language?: string;
}

export const preferenceOptions = {
  transportation: [
    { value: "public_transit", label: "Public transit" },
    { value: "private_car", label: "Private car / taxi" },
    { value: "motorcycle", label: "Motorcycle / scooter" },
    { value: "walking", label: "Walking / hiking" },
    { value: "bicycle", label: "Bicycle" },
    { value: "mixed", label: "Mixed" },
  ],
  travelStyle: [
    { value: "cultural", label: "Cultural & historical" },
    { value: "nature", label: "Nature & outdoors" },
    { value: "food", label: "Food & culinary" },
    { value: "adventure", label: "Adventure & sports" },
    { value: "relaxation", label: "Relaxation & wellness" },
    { value: "shopping", label: "Shopping" },
  ],
  companions: [
    { value: "solo", label: "Solo traveler" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family with children" },
    { value: "friends", label: "Friends" },
    { value: "group", label: "Organized group" },
  ],
  activityLevel: [
    { value: "low", label: "Low — relaxed pace" },
    { value: "moderate", label: "Moderate — some walking" },
    { value: "high", label: "High — active days" },
    { value: "very_high", label: "Very high — dawn to dusk" },
  ],
  budget: [
    { value: "budget", label: "Budget" },
    { value: "mid_range", label: "Mid-range" },
    { value: "luxury", label: "Luxury" },
    { value: "mixed", label: "Mixed" },
  ],
} as const;

export const preferenceLabels: Record<string, string> = Object.fromEntries(
  Object.values(preferenceOptions)
    .flatMap((options) => options.map((o) => [o.value, o.label])),
);

export function summarizePreferences(prefs: TravelerPreferences): string[] {
  const parts: string[] = [];
  if (prefs.transportation) {
    parts.push(preferenceLabels[prefs.transportation] ?? prefs.transportation);
  }
  if (prefs.travelStyle) {
    parts.push(preferenceLabels[prefs.travelStyle] ?? prefs.travelStyle);
  }
  if (prefs.companions) {
    parts.push(preferenceLabels[prefs.companions] ?? prefs.companions);
  }
  if (prefs.activityLevel) {
    parts.push(preferenceLabels[prefs.activityLevel] ?? prefs.activityLevel);
  }
  if (prefs.budget) {
    parts.push(preferenceLabels[prefs.budget] ?? prefs.budget);
  }
  return parts;
}

export function hasPreferences(prefs: TravelerPreferences): boolean {
  return Boolean(
    prefs.transportation ||
      prefs.travelStyle ||
      prefs.companions ||
      prefs.activityLevel ||
      prefs.budget ||
      prefs.language,
  );
}

const categoryAffinity: Record<string, string[]> = {
  cultural: ["attractions", "foods", "events"],
  nature: ["attractions"],
  food: ["restaurants", "foods"],
  adventure: ["attractions", "events"],
  relaxation: ["attractions"],
  shopping: ["events"],
};

export function recommendedCategories(prefs: TravelerPreferences): string[] {
  if (!prefs.travelStyle) return [];
  return categoryAffinity[prefs.travelStyle] ?? [];
}
