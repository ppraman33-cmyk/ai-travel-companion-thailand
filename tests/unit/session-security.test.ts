import { describe, expect, it } from "vitest";

import { AnonymousSessionService } from "@/application/public-api/anonymous-session-service";
import type {
  AnonymousSessionCrypto,
  AnonymousSessionRecord,
  AnonymousSessionRepository,
} from "@/application/public-api/contracts";
import type { AppError } from "@/shared/errors/app-error";
import { success, type Result } from "@/shared/result/result";

class MemorySessions implements AnonymousSessionRepository {
  records = new Map<string, AnonymousSessionRecord>();
  async create(record: AnonymousSessionRecord) {
    this.records.set(record.secretHash, record);
    return success(undefined);
  }
  async findBySecretHash(hash: string) {
    return success(this.records.get(hash) ?? null);
  }
  async revoke(id: string): Promise<Result<void, AppError>> {
    for (const [hash, record] of this.records) {
      if (record.id === id)
        this.records.set(hash, { ...record, revokedAt: new Date().toISOString() });
    }
    return success(undefined);
  }
}

const fakeCrypto: AnonymousSessionCrypto = {
  randomSecret: (bytes) =>
    bytes === 32 ? "high-entropy-session-secret" : "csrf-token",
  hashSecret: (secret) => `synthetic-hash-${secret.length}`,
  randomId: () => "synthetic-session-id",
};

describe("anonymous session security", () => {
  it("stores only a hash and authenticates the server-issued secret", async () => {
    const repository = new MemorySessions();
    const service = new AnonymousSessionService(repository, fakeCrypto);
    const issued = await service.issue("en");
    expect(issued.ok).toBe(true);
    expect([...repository.records.keys()]).toEqual(["synthetic-hash-27"]);
    expect(JSON.stringify([...repository.records.values()])).not.toContain(
      "high-entropy-session-secret",
    );
    expect((await service.authenticate("high-entropy-session-secret")).ok).toBe(true);
    expect((await service.authenticate("public-session-uuid")).ok).toBe(false);
  });

  it("rejects a revoked session", async () => {
    const repository = new MemorySessions();
    const service = new AnonymousSessionService(repository, fakeCrypto);
    await service.issue("en");
    await service.revoke("high-entropy-session-secret");
    expect((await service.authenticate("high-entropy-session-secret")).ok).toBe(false);
  });
});
