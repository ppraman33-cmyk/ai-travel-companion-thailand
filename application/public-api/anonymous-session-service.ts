import type { AppError } from "@/shared/errors/app-error";
import { appError } from "@/shared/errors/app-error";
import { failure, success, type Result } from "@/shared/result/result";

import type {
  AnonymousSessionCrypto,
  AnonymousSessionRecord,
  AnonymousSessionRepository,
} from "./contracts";

export interface IssuedAnonymousSession {
  readonly id: string;
  readonly secret: string;
  readonly csrfToken: string;
  readonly expiresAt: string;
}

export class AnonymousSessionService {
  constructor(
    private readonly repository: AnonymousSessionRepository,
    private readonly crypto: AnonymousSessionCrypto,
    private readonly lifetimeSeconds = 60 * 60 * 24 * 30,
  ) {}

  async issue(
    locale: string,
    now = new Date(),
  ): Promise<Result<IssuedAnonymousSession, AppError>> {
    const secret = this.crypto.randomSecret(32);
    const csrfToken = this.crypto.randomSecret(24);
    const expiresAt = new Date(
      now.getTime() + this.lifetimeSeconds * 1000,
    ).toISOString();
    const record: AnonymousSessionRecord = {
      id: this.crypto.randomId(),
      secretHash: this.crypto.hashSecret(secret),
      locale,
      expiresAt,
    };
    const created = await this.repository.create(record);
    return created.ok
      ? success({ id: record.id, secret, csrfToken, expiresAt })
      : created;
  }

  async authenticate(
    secret: string | undefined,
  ): Promise<Result<AnonymousSessionRecord, AppError>> {
    if (!secret) {
      return failure(appError("PERMISSION", "Anonymous session is required."));
    }
    const record = await this.repository.findBySecretHash(
      this.crypto.hashSecret(secret),
    );
    if (!record.ok) return record;
    if (
      !record.value ||
      record.value.revokedAt ||
      new Date(record.value.expiresAt) <= new Date()
    ) {
      return failure(
        appError("PERMISSION", "Anonymous session is invalid or expired."),
      );
    }
    return success(record.value);
  }

  async revoke(secret: string | undefined): Promise<Result<void, AppError>> {
    const authenticated = await this.authenticate(secret);
    return authenticated.ok
      ? this.repository.revoke(authenticated.value.id)
      : authenticated;
  }
}
