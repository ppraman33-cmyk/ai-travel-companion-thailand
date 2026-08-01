const contentModules = [
  "Provinces",
  "Attractions",
  "Restaurants",
  "Local specialties",
  "Festivals",
  "Emergency services",
] as const;

export function AdminContentWorkspace() {
  return (
    <section aria-labelledby="content-workspace-title" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
            Nationwide CMS
          </p>
          <h2 className="mt-1 text-2xl font-bold" id="content-workspace-title">
            Content workspace
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold"
            type="button"
          >
            Import drafts
          </button>
          <button
            className="rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white"
            type="button"
          >
            Create content
          </button>
        </div>
      </div>
      <form
        className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
        role="search"
      >
        <label className="grid gap-1 text-sm font-semibold">
          Search
          <input
            className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal"
            placeholder="Name, code, or tag"
            type="search"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Province
          <select className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal">
            <option>All provinces</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Workflow
          <select className="min-h-11 rounded-xl border border-slate-300 px-3 font-normal">
            <option>All states</option>
            <option>Draft</option>
            <option>Review</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
        </label>
        <button
          className="mt-auto min-h-11 rounded-xl bg-slate-900 px-4 font-semibold text-white"
          type="submit"
        >
          Apply filters
        </button>
      </form>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentModules.map((module) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={module}
          >
            <div
              className="aspect-[3/1] rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-bold">{module}</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create, review, verify, preview, publish, and archive standardized
              records.
            </p>
            <button className="mt-4 font-bold text-emerald-700" type="button">
              Open module
            </button>
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        Bulk import creates bounded draft batches only. It cannot bypass evidence,
        verification, media-rights, or emergency publication gates.
      </p>
    </section>
  );
}
