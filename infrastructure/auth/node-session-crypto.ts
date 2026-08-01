import { createHash, randomBytes, randomUUID } from "node:crypto";

import type { AnonymousSessionCrypto } from "@/application/public-api/contracts";

export class NodeAnonymousSessionCrypto implements AnonymousSessionCrypto {
  randomSecret(bytes: number): string {
    return randomBytes(bytes).toString("base64url");
  }

  hashSecret(secret: string): string {
    return createHash("sha256").update(secret, "utf8").digest("hex");
  }

  randomId(): string {
    return randomUUID();
  }
}
