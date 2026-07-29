import { describe, expect, it } from "vitest";

import { parseAppConfig } from "@/config/env";

describe("parseAppConfig", () => {
  it("parses development feature flags", () => {
    const config = parseAppConfig({
      NEXT_PUBLIC_APP_ENV: "development",
      NEXT_PUBLIC_FEATURE_AI: "false",
      NEXT_PUBLIC_FEATURE_EVENTS: "true",
      NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA: "true",
    });

    expect(config.environment).toBe("development");
    expect(config.features.events).toBe(true);
    expect(config.features.syntheticData).toBe(true);
  });

  it("rejects synthetic data in production", () => {
    expect(() =>
      parseAppConfig({
        NEXT_PUBLIC_APP_ENV: "production",
        NEXT_PUBLIC_FEATURE_SYNTHETIC_DATA: "true",
      }),
    ).toThrow("Synthetic data must be disabled in production");
  });
});
