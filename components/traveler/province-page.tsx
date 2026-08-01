import Link from "next/link";

import { CatalogPreview } from "./catalog-preview";

export interface Province {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly history?: string;
  readonly geography?: string;
  readonly climate?: string;
  readonly capitalDistrict?: string;
  readonly areaSquareKm?: number;
  readonly population?: number;
  readonly provinceMotto?: string;
  readonly mapActions?: {
    readonly googleDirections: string;
    readonly appleDirections: string;
  };
}

const actions = [
  ["Attractions", "attractions"],
  ["Restaurants", "restaurants"],
  ["Local specialties", "specialties"],
  ["Festivals", "festivals"],
  ["Emergency", "emergency"],
] as const;

export function ProvincePage({ province }: { readonly province: Province | null }) {
  if (province === null) {
    return (
      <section className="rounded-3xl bg-slate-100 p-8">
        <h1 className="text-3xl font-bold">Province profile unavailable</h1>
        <p className="mt-3 text-slate-600">
          This province is still in evidence review or is not published.
        </p>
        <Link
          className="mt-5 inline-block font-semibold text-emerald-700"
          href="/explore"
        >
          Back to Explore
        </Link>
      </section>
    );
  }

  const filter = `destination=${encodeURIComponent(province.id)}`;
  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-500 px-6 py-16 text-white sm:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">
          Province guide
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
          {province.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-emerald-50">
          {province.description ?? "A verified traveler summary is being prepared."}
        </p>
        {province.mapActions ? (
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className="rounded-2xl bg-white px-5 py-3 font-bold text-emerald-900"
              href={province.mapActions.googleDirections}
              rel="noopener noreferrer"
              target="_blank"
            >
              Navigate with Google Maps
            </a>
            <a
              className="rounded-2xl border border-white/40 bg-white/10 px-5 py-3 font-bold"
              href={province.mapActions.appleDirections}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Apple Maps
            </a>
          </div>
        ) : null}
      </section>
      <nav aria-label="Province quick actions">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {actions.map(([label, anchor]) => (
            <li key={anchor}>
              <a
                className="grid min-h-20 place-items-center rounded-2xl border border-emerald-100 bg-white px-3 text-center text-sm font-bold shadow-sm hover:bg-emerald-50"
                href={`#${anchor}`}
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <Link
              className="grid min-h-20 place-items-center rounded-2xl bg-emerald-700 px-3 text-center text-sm font-bold text-white"
              href="/assistant"
            >
              Ask AI
            </Link>
          </li>
        </ul>
      </nav>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-2xl font-bold">About {province.name}</h2>
          <p className="mt-4 text-slate-600">
            {province.history ??
              province.geography ??
              "Verified history and geography are not yet available."}
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {province.capitalDistrict ? (
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  Capital district
                </dt>
                <dd className="mt-1">{province.capitalDistrict}</dd>
              </div>
            ) : null}
            {province.climate ? (
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Climate</dt>
                <dd className="mt-1">{province.climate}</dd>
              </div>
            ) : null}
            {province.areaSquareKm ? (
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">Area</dt>
                <dd className="mt-1">{province.areaSquareKm.toLocaleString()} km²</dd>
              </div>
            ) : null}
            {province.population ? (
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500">
                  Population
                </dt>
                <dd className="mt-1">{province.population.toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>
        </article>
        <article className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-6">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            COMING SOON
          </span>
          <h2 className="mt-5 text-2xl font-bold">Illustrated province map</h2>
          <p className="mt-3 text-slate-600">
            A future 3D illustrated map and interactive landmark pins will plug into
            this reserved provider-neutral section.
          </p>
        </article>
      </section>
      <div id="attractions">
        <CatalogPreview
          endpoint={`/api/v1/attractions?${filter}&limit=6`}
          heading="Featured attractions"
          href={`/explore?${filter}`}
        />
      </div>
      <div id="restaurants">
        <CatalogPreview
          endpoint={`/api/v1/restaurants?${filter}&limit=6`}
          heading="Recommended restaurants"
          href={`/food?${filter}`}
        />
      </div>
      <div id="specialties">
        <CatalogPreview
          endpoint={`/api/v1/foods?${filter}&limit=6`}
          heading="Local specialties"
          href={`/food?${filter}`}
        />
      </div>
      <div id="festivals">
        <CatalogPreview
          endpoint={`/api/v1/events?${filter}&limit=6`}
          heading="Festivals and events"
          href={`/events?${filter}`}
        />
      </div>
      <div id="emergency">
        <CatalogPreview
          endpoint={`/api/v1/emergency-services?${filter}&limit=6`}
          heading="Verified emergency help"
          href={`/help?${filter}`}
        />
      </div>
    </>
  );
}
