import { createClient } from "@supabase/supabase-js";

import type {
  AdminEvidenceMutation,
  AdminEvidenceMutationRepository,
} from "@/application/admin/evidence-mutation";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

export class SupabaseAdminEvidenceRepository implements AdminEvidenceMutationRepository {
  private readonly client;
  constructor(url: string, publishableKey: string, accessToken: string) {
    this.client = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
  async mutate(command: AdminEvidenceMutation, correlationId: string) {
    const { data, error } = await this.client.rpc("admin_evidence_mutate", {
      p_command: command,
      p_correlation_id: correlationId,
    });
    if (error)
      return failure(
        appError(
          error.code === "42501" ? "PERMISSION" : "VALIDATION",
          error.code === "42501"
            ? "This evidence operation is not permitted."
            : "The evidence mutation was rejected.",
          { cause: error },
        ),
      );
    return success(data);
  }
}
