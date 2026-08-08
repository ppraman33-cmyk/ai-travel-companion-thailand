import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

const cspFor = () =>
  proxy(new NextRequest("https://travel.example.test/explore")).headers.get(
    "content-security-policy",
  ) ?? "";

describe("nonce Content Security Policy", () => {
  it("creates a unique cryptographic nonce for every document request", () => {
    const first = cspFor();
    const second = cspFor();
    const nonce = (policy: string) => policy.match(/'nonce-([^']+)'/)?.[1];

    expect(nonce(first)).toBeTruthy();
    expect(nonce(second)).toBeTruthy();
    expect(nonce(first)).not.toBe(nonce(second));
    expect(first).toContain("'strict-dynamic'");
    expect(first).toContain("frame-ancestors 'none'");
    expect(first).not.toContain("'unsafe-inline'");
    expect(first).not.toContain("'unsafe-eval'");
    expect(first).toContain("img-src 'self' blob: data:");
    expect(first).not.toContain("images.pexels.com");
    expect(first).not.toMatch(/img-src[^;]*https:\/\//);
  });
});
