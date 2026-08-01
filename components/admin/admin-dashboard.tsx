import type { PublicationEligibility } from "@/application/content/types";
import { AdminContentWorkspace } from "./admin-content-workspace";

export interface AdminDashboardSummary {
  readonly draft: number;
  readonly evidencePending: number;
  readonly reviewPending: number;
  readonly stale: number;
  readonly suppressed: number;
  readonly emergencyVerification: number;
  readonly expiringLicenses: number;
  readonly openReports: number;
}

const labels: Readonly<Record<keyof AdminDashboardSummary, string>> = {
  draft: "Drafts",
  evidencePending: "Evidence pending",
  reviewPending: "Review pending",
  stale: "Stale content",
  suppressed: "Suppressed",
  emergencyVerification: "Emergency verification",
  expiringLicenses: "Expiring licenses",
  openReports: "Correction reports",
};

export function AdminDashboard({
  summary,
  eligibility,
}: {
  readonly summary: AdminDashboardSummary;
  readonly eligibility?: PublicationEligibility;
}) {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white px-8 py-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Internal operations
        </p>
        <h1 className="mt-1 text-3xl font-bold">Content dashboard</h1>
      </header>
      <div className="grid gap-8 p-8 lg:grid-cols-[15rem_1fr]">
        <nav
          aria-label="Admin sections"
          className="rounded-xl bg-emerald-700 p-4 text-white"
        >
          <ul className="grid gap-2">
            {Object.values(labels).map((label) => (
              <li key={label}>
                <a
                  className="block min-h-11 rounded-lg px-3 py-2 hover:bg-emerald-600 focus-visible:bg-emerald-600"
                  href={`#${label.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <section aria-labelledby="queues-heading">
          <h2 id="queues-heading" className="text-2xl font-semibold">
            Operational queues
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(summary).map(([key, count]) => (
              <article
                className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
                id={labels[key as keyof AdminDashboardSummary]
                  .toLowerCase()
                  .replaceAll(" ", "-")}
                key={key}
              >
                <h3 className="text-sm font-medium text-[var(--color-muted)]">
                  {labels[key as keyof AdminDashboardSummary]}
                </h3>
                <p className="mt-2 text-3xl font-bold">{count}</p>
              </article>
            ))}
          </div>
          {eligibility && !eligibility.eligible ? (
            <section
              aria-labelledby="eligibility-heading"
              className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
              role="status"
            >
              <h2 id="eligibility-heading" className="font-semibold">
                Publication blocked
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {eligibility.reasons.map((reason) => (
                  <li key={reason}>{reason.replaceAll("_", " ").toLowerCase()}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <AdminContentWorkspace />
        </section>
      </div>
    </main>
  );
}
