import { AnonymousSessionService } from "@/application/public-api/anonymous-session-service";
import { PublicCatalogService } from "@/application/public-api/catalog-service";
import type { PublicCatalogReader } from "@/application/public-api/contracts";
import { TravelerService } from "@/application/public-api/traveler-service";
import { NodeAnonymousSessionCrypto } from "@/infrastructure/auth/node-session-crypto";
import { ExternalMapHandoffProvider } from "@/infrastructure/maps/external-map-handoff-provider";
import { PublicCatalogPersistenceReader } from "@/infrastructure/repositories/public-catalog-persistence-reader";
import { SessionPersistenceAdapter } from "@/infrastructure/repositories/session-persistence-adapter";
import { TravelerPersistenceAdapter } from "@/infrastructure/repositories/traveler-persistence-adapter";
import { InMemoryRateLimiter } from "@/infrastructure/security/in-memory-rate-limiter";
import {
  createPublicPersistenceClient,
  createServicePersistenceClient,
} from "@/infrastructure/supabase/supabase-persistence-client";
import { appError } from "@/shared/errors/app-error";
import { failure } from "@/shared/result/result";

class UnavailableCatalogReader implements PublicCatalogReader {
  async read() {
    return failure(
      appError(
        "UNAVAILABLE",
        "Public catalog is unavailable until database configuration is complete.",
        {
          retryable: true,
        },
      ),
    );
  }
}

const url = process.env.SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const environment =
  process.env.NEXT_PUBLIC_APP_ENV === "production"
    ? "production"
    : process.env.NEXT_PUBLIC_APP_ENV === "test"
      ? "test"
      : "development";

const publicPersistence =
  url && publishableKey ? createPublicPersistenceClient({ url, publishableKey }) : null;
const servicePersistence =
  url && serviceRoleKey
    ? createServicePersistenceClient({ url, serviceRoleKey, environment })
    : null;

export const runtime = {
  catalog: new PublicCatalogService(
    publicPersistence
      ? new PublicCatalogPersistenceReader(publicPersistence)
      : new UnavailableCatalogReader(),
    new ExternalMapHandoffProvider(),
  ),
  sessions: servicePersistence
    ? new AnonymousSessionService(
        new SessionPersistenceAdapter(servicePersistence),
        new NodeAnonymousSessionCrypto(),
      )
    : null,
  traveler: servicePersistence
    ? new TravelerService(new TravelerPersistenceAdapter(servicePersistence))
    : null,
  rateLimiter: new InMemoryRateLimiter(),
  ai: null,
};
