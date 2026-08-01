import { describe, expect, it } from "vitest";

import { PublicCatalogService } from "@/application/public-api/catalog-service";
import type { PublicCatalogReader } from "@/application/public-api/contracts";
import { success } from "@/shared/result/result";

describe("PublicCatalogService", () => {
  it("bounds page size and preserves deterministic reader results", async () => {
    const reader: PublicCatalogReader = {
      read: async (query) =>
        success({
          items: [],
          nextCursor: query.limit === 50 ? "synthetic-next-id" : undefined,
        }),
    };
    const service = new PublicCatalogService(reader);
    const result = await service.list({
      kind: "places",
      locale: "en",
      limit: 500,
    });
    expect(result).toEqual(success({ items: [], nextCursor: "synthetic-next-id" }));
  });
});
