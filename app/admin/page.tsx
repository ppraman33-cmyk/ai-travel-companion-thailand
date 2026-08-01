import { cookies } from "next/headers";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  ADMIN_ACCESS_COOKIE,
  createAdminAccess,
} from "@/infrastructure/auth/supabase-admin-access";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const boundary = createAdminAccess(cookieStore.get(ADMIN_ACCESS_COOKIE)?.value);
  const access = boundary ? await boundary.resolveCurrentAdmin() : null;

  if (!access?.ok || access.value === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          Access denied
        </p>
        <h1 className="mt-2 text-3xl font-bold">Admin authentication required</h1>
        <p className="mt-4 text-[var(--color-muted)]">
          This interface fails closed until the approved Supabase Auth boundary is
          configured and verified. No preview authorization is inferred.
        </p>
      </main>
    );
  }

  return (
    <AdminDashboard
      summary={{
        draft: 0,
        evidencePending: 0,
        reviewPending: 0,
        stale: 0,
        suppressed: 0,
        emergencyVerification: 0,
        expiringLicenses: 0,
        openReports: 0,
      }}
    />
  );
}
