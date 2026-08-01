import { createClient } from "@supabase/supabase-js";

import type { AdminContentMutation } from "@/application/admin/content-mutation";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

export class SupabaseAdminContentRepository {
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

  async mutate(command: AdminContentMutation, correlationId: string) {
    const { data, error } = await this.client.rpc("admin_content_mutate", {
      p_command: command,
      p_correlation_id: correlationId,
    });
    if (error) {
      const permission = error.code === "42501";
      return failure(
        appError(
          permission ? "PERMISSION" : "VALIDATION",
          permission
            ? "This admin operation is not permitted."
            : "The content mutation was rejected.",
          { cause: error },
        ),
      );
    }
    return success(data);
  }
}
