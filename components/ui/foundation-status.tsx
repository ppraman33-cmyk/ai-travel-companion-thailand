const boundaries = [
  "Anonymous traveler sessions",
  "Provider-independent contracts",
  "Synthetic fixtures restricted to non-production use",
] as const;

export function FoundationStatus() {
  return (
    <section
      aria-labelledby="foundation-heading"
      className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12"
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-700">
        Phase 3A
      </p>
      <h1 id="foundation-heading" className="text-4xl font-bold tracking-tight">
        Implementation foundation
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
        The application shell and architectural boundaries are ready. No travel content
        or business features are implemented in this phase.
      </p>
      <ul className="mt-8 grid gap-3" aria-label="Foundation boundaries">
        {boundaries.map((boundary) => (
          <li
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-sm)]"
            key={boundary}
          >
            {boundary}
          </li>
        ))}
      </ul>
    </section>
  );
}
