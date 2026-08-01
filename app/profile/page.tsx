import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function ProfilePage() {
  return (
    <TravelerShell>
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Traveler settings
        </p>
        <h1 className="mt-2 text-4xl font-bold">Profile</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          The MVP uses an anonymous private session. No account, personal profile, or
          cross-device synchronization is created.
        </p>
      </section>
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-bold">Privacy-first by default</h2>
        <ul className="mt-4 grid gap-3 text-slate-600">
          <li>Trips belong only to the current anonymous session.</li>
          <li>No precise location history is stored.</li>
          <li>You can revoke the session when session persistence is configured.</li>
        </ul>
      </section>
    </TravelerShell>
  );
}
