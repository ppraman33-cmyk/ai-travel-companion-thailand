import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function AssistantPage() {
  return (
    <TravelerShell>
      <section className="mx-auto w-full max-w-2xl rounded-[2rem] bg-gradient-to-br from-emerald-900 to-teal-600 p-8 text-white shadow-xl sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-100">
          Grounded assistant
        </p>
        <h1 className="mt-3 text-4xl font-bold">AI travel help</h1>
        <p className="mt-5 text-lg text-emerald-50">
          AI trip planning is not part of Phase 4. This entry point is reserved for the
          existing provider-neutral assistant, which remains disabled until an approved
          provider and budget are configured.
        </p>
        <div className="mt-8 rounded-2xl bg-white/10 p-5">
          <p className="font-semibold">No live AI request will be sent.</p>
          <p className="mt-2 text-sm text-emerald-100">
            Verified catalog browsing and trip tools continue to work independently.
          </p>
        </div>
      </section>
    </TravelerShell>
  );
}
