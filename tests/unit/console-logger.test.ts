import { describe, expect, it } from "vitest";

import { redactLogContext } from "@/infrastructure/logging/console-logger";

describe("redactLogContext", () => {
  it("redacts likely secrets while retaining safe context", () => {
    expect(
      redactLogContext({ sessionToken: "secret", requestId: "synthetic-request" }),
    ).toEqual({
      sessionToken: "[REDACTED]",
      requestId: "synthetic-request",
    });
  });
});
