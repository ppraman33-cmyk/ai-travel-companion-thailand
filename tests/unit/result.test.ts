import { describe, expect, it } from "vitest";

import { failure, success } from "@/shared/result/result";

describe("Result", () => {
  it("represents success without throwing", () => {
    expect(success("ready")).toEqual({ ok: true, value: "ready" });
  });

  it("represents failure without throwing", () => {
    expect(failure("not-ready")).toEqual({ ok: false, error: "not-ready" });
  });
});
