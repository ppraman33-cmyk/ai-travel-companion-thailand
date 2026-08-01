import type { AppError } from "@/shared/errors/app-error";
import type { Result } from "@/shared/result/result";

export type PublicCatalogKind =
  | "destinations"
  | "places"
  | "restaurants"
  | "attractions"
  | "foods"
  | "events"
  | "event-occurrences"
  | "emergency-services"
  | "search";

export interface PublicCatalogQuery {
  readonly kind: PublicCatalogKind;
  readonly id?: string;
  readonly destinationId?: string;
  readonly category?: string;
  readonly locale: string;
  readonly cursor?: string;
  readonly limit: number;
  readonly activeFrom?: string;
  readonly activeUntil?: string;
  readonly keyword?: string;
  readonly districtId?: string;
}

export interface PublicCatalogRecord {
  readonly id: string;
  readonly kind: PublicCatalogKind;
  readonly name: string;
  readonly canonicalThaiName?: string;
  readonly summary?: string;
  readonly destinationId?: string;
  readonly category?: string;
  readonly address?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly informationCheckedAt?: string;
  readonly slug?: string;
  readonly region?: string;
  readonly description?: string;
  readonly history?: string;
  readonly climate?: string;
  readonly geography?: string;
  readonly capitalDistrict?: string;
  readonly areaSquareKm?: number;
  readonly population?: number;
  readonly provinceMotto?: string;
  readonly tags?: readonly string[];
  readonly futureMapStatus?: "coming_soon";
  readonly mapActions?: Readonly<{
    googleDirections: string;
    appleDirections: string;
  }>;
}

export interface PublicCatalogPage {
  readonly items: readonly PublicCatalogRecord[];
  readonly nextCursor?: string;
}

export interface PublicCatalogReader {
  read(query: PublicCatalogQuery): Promise<Result<PublicCatalogPage, AppError>>;
}

export interface AnonymousSessionRecord {
  readonly id: string;
  readonly secretHash: string;
  readonly locale: string;
  readonly expiresAt: string;
  readonly revokedAt?: string;
}

export interface AnonymousSessionRepository {
  create(record: AnonymousSessionRecord): Promise<Result<void, AppError>>;
  findBySecretHash(
    hash: string,
  ): Promise<Result<AnonymousSessionRecord | null, AppError>>;
  revoke(id: string): Promise<Result<void, AppError>>;
}

export interface AnonymousSessionCrypto {
  randomSecret(bytes: number): string;
  hashSecret(secret: string): string;
  randomId(): string;
}
