export const featureFlagNames = [
  "ai",
  "events",
  "emergency",
  "savedTrips",
  "accounts",
  "admin",
  "syntheticData",
] as const;

export type FeatureFlagName = (typeof featureFlagNames)[number];
export type FeatureFlags = Readonly<Record<FeatureFlagName, boolean>>;

export const defaultFeatureFlags: FeatureFlags = {
  ai: false,
  events: false,
  emergency: false,
  savedTrips: false,
  accounts: false,
  admin: false,
  syntheticData: false,
};
