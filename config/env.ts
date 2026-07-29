import { z } from "zod";

import type { FeatureFlags } from "@/config/feature-flags";

const booleanString = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const environmentSchema = z
  .object({
    NEXT_PUBLIC_APP_ENV: z.enum(["development", "test", "production"]),
    NEXT_PUBLIC_FEATURE_AI: booleanString,
    NEXT_PUBLIC_FEATURE_EVENTS: booleanString,
    NEXT_PUBLIC_FEATURE_EMERGENCY: booleanString,
    NEXT_PUBLIC_FEATURE_SAVED_TRIPS: booleanString,
    NEXT_PUBLIC_FEATURE_ACCOUNTS: booleanString,
    NEXT_PUBLIC_FEATURE_ADMIN: booleanString,
    NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA: booleanString,
  })
  .superRefine((value, context) => {
    if (
      value.NEXT_PUBLIC_APP_ENV === "production" &&
      value.NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA
    ) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA"],
        message: "Synthetic data must be disabled in production.",
      });
    }
  });

export type AppEnvironment = "development" | "test" | "production";

export interface AppConfig {
  readonly environment: AppEnvironment;
  readonly features: FeatureFlags;
}

export function parseAppConfig(input: Record<string, string | undefined>): AppConfig {
  const value = environmentSchema.parse(input);

  return {
    environment: value.NEXT_PUBLIC_APP_ENV,
    features: {
      ai: value.NEXT_PUBLIC_FEATURE_AI,
      events: value.NEXT_PUBLIC_FEATURE_EVENTS,
      emergency: value.NEXT_PUBLIC_FEATURE_EMERGENCY,
      savedTrips: value.NEXT_PUBLIC_FEATURE_SAVED_TRIPS,
      accounts: value.NEXT_PUBLIC_FEATURE_ACCOUNTS,
      admin: value.NEXT_PUBLIC_FEATURE_ADMIN,
      syntheticData: value.NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA,
    },
  };
}
