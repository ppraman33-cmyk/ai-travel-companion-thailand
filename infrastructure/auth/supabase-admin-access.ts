import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { AdminAccessBoundary } from "@/application/admin/admin-access";
import { appError } from "@/shared/errors/app-error";
import { failure, success } from "@/shared/result/result";

type AdminRow = Readonly<{
  id: string;
  role: "founder" | "editor";
  active: boolean;
}>;

export const ADMIN_ACCESS_COOKIE = "atct_admin_access_token";

/**
 * Resolves admin identity from a Supabase-issued access token. The caller never
 * supplies an admin id or role; both are derived from verified server-side data.
 */
export class SupabaseAdminAccess implements AdminAccessBoundary {
  private readonly client: SupabaseClient;

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

  async resolveCurrentAdmin() {
    const userResult = await this.client.auth.getUser();
    if (userResult.error || !userResult.data.user) return success(null);

    const adminResult = await this.client
      .from("admin_users")
      .select("id, role, active")
      .eq("auth_subject", userResult.data.user.id)
      .eq("active", true)
      .maybeSingle<AdminRow>();

    if (adminResult.error) {
      return failure(
        appError("PROVIDER", "Admin authorization could not be verified.", {
          cause: adminResult.error,
          retryable: true,
        }),
      );
    }

    if (!adminResult.data) return success(null);
    return success({ id: adminResult.data.id, role: adminResult.data.role });
  }
}

export const createAdminAccess = (accessToken?: string) => {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey || !accessToken) return null;
  return new SupabaseAdminAccess(url, publishableKey, accessToken);
};
