import Link from "next/link";

import {
  categoryLabels,
  demoItems,
  demoProvince,
  demoProvinces,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import { ExploreRecommendations } from "@/components/traveler/explore-recommendations";
import { SyntheticVisual } from "@/components/traveler/synthetic-visual";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  CategoryChip,
  Select,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";

export default async function ExplorePage({
  searchParams,
}: {
  readonly searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const { q = "", state } = await searchParams;
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  const filtered = demoItems.filter((item) =>
    `${item.name} ${item.thaiName} ${item.category}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <TravelerShell>
      <SyntheticNotice />
      <header>
        <p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-700">
          Discover Thailand
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl">Explore</h1>
        <p className="mt-2 text-slate-600">
          Search synthetic journeys while real content remains evidence-gated.
        </p>
      </header>

      <form
        action="/explore"
        className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_minmax(0,12rem)_auto]"
        role="search"
      >
        <label className="sr-only" htmlFor="explore-search">
          Search demo content
        </label>
        <input
          className="min-h-12 rounded-xl border border-slate-300 px-4"
          defaultValue={q}
          id="explore-search"
          name="q"
          placeholder="Where do you want to go?"
          type="search"
        />
        <label className="sr-only" htmlFor="region">
          Region
        </label>
        <Select id="region" name="region">
          <option>All regions</option>
          <option>Northern (synthetic)</option>
        </Select>
        <label className="sr-only" htmlFor="province">
          Province
        </label>
        <Select id="province" name="province">
          <option>All provinces</option>
          <option>Demo Lanna (synthetic)</option>
        </Select>
        <button
          className="min-h-12 rounded-xl bg-emerald-800 px-5 font-bold text-white"
          type="submit"
        >
          Search
        </button>
      </form>

      <nav
        aria-label="Explore categories"
        className="flex w-full max-w-[calc(100vw-2rem)] gap-2 overflow-x-auto pb-2 sm:max-w-[calc(100vw-3rem)] lg:max-w-none"
      >
        {(Object.keys(categoryLabels) as DemoCategory[]).map((category) => (
          <CategoryChip href={`${base}/${category}`} key={category}>
            {categoryLabels[category]}
          </CategoryChip>
        ))}
      </nav>

      <ExploreRecommendations />

      <section
        aria-labelledby="province-discovery-title"
        className="overflow-hidden rounded-[2rem] bg-white shadow-sm lg:grid lg:grid-cols-[1.1fr_.9fr]"
      >
        <SyntheticVisual
          className="h-full min-h-72"
          icon="map"
          label="Synthetic Thailand region discovery placeholder"
          palette="sky"
        />
        <div className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
            Region &amp; province discovery · synthetic
          </p>
          <h2 className="mt-2 text-3xl font-black" id="province-discovery-title">
            Choose a demo region, then go deeper.
          </h2>
          <p className="mt-3 text-slate-600">
            This code-native visual makes no real map, boundary or geographic claim.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-800 px-4 font-bold text-white"
            href={base}
          >
            Open synthetic province guide
          </Link>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {demoProvinces.map((province) => (
              <Link
                className="rounded-xl border border-emerald-100 p-3 font-bold hover:bg-emerald-50"
                href={province.name === "Demo Lanna" ? base : "/explore"}
                key={province.name}
              >
                {province.region}
                <small className="block font-normal text-slate-500">
                  {province.name} · synthetic
                </small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="explore-results-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              Synthetic catalog results
            </p>
            <h2 className="text-2xl font-black" id="explore-results-title">
              Explore results
            </h2>
          </div>
          <span className="text-sm text-slate-500">{filtered.length} results</span>
        </div>
        {state === "loading" ? (
          <div className="mt-4">
            <StatusState
              state="loading"
              title="Loading demo results"
              description="Checking approved synthetic catalog states…"
            />
          </div>
        ) : state === "error" ? (
          <div className="mt-4">
            <StatusState
              state="error"
              title="Explore is unavailable"
              description="Try again without exposing unverified fallback data."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-4">
            <StatusState
              state="empty"
              title="No matching demo journeys"
              description="Try another search or clear your filters."
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <li key={item.id}>
                <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </TravelerShell>
  );
}
