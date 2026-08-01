import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";
import type { MapHandoffProvider } from "@/providers/maps/map-handoff-provider";

import type {
  PublicCatalogPage,
  PublicCatalogQuery,
  PublicCatalogReader,
} from "./contracts";

export class PublicCatalogService {
  constructor(
    private readonly reader: PublicCatalogReader,
    private readonly maps?: MapHandoffProvider,
  ) {}

  async list(query: PublicCatalogQuery): Promise<Result<PublicCatalogPage, AppError>> {
    const result = await this.reader.read({
      ...query,
      limit: Math.min(Math.max(query.limit, 1), 50),
    });
    if (!result.ok || !this.maps) return result;
    return {
      ok: true,
      value: {
        ...result.value,
        items: result.value.items.map((record) => {
          if (record.latitude === undefined || record.longitude === undefined)
            return record;
          const request = {
            action: "directions" as const,
            placeId: record.id,
            destination: { latitude: record.latitude, longitude: record.longitude },
            destinationLabel: record.name,
          };
          const google = this.maps?.createExternalHandoffUrl({
            ...request,
            application: "google_maps",
          });
          const apple = this.maps?.createExternalHandoffUrl({
            ...request,
            application: "apple_maps",
          });
          return google?.ok && apple?.ok
            ? {
                ...record,
                mapActions: {
                  googleDirections: google.value.toString(),
                  appleDirections: apple.value.toString(),
                },
              }
            : record;
        }),
      },
    };
  }
}
