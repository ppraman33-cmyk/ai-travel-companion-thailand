import Link from "next/link";

import { CatalogPreview } from "@/components/traveler/catalog-preview";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function HomePage() {
  return (
    <TravelerShell>
      <section className="relative isolate min-h-[30rem] overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-emerald-950 via-emerald-700 to-teal-400 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-20 -z-10 size-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 -z-10 size-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="flex min-h-[24rem] max-w-2xl flex-col justify-end">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-100">
            Discover all 77 provinces
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-6xl">
            Thailand, thoughtfully explored
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-emerald-50">
            Find verified attractions, genuine local specialties, festivals,
            restaurants, and traveler help—province by province.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-2xl bg-white px-6 py-3.5 font-bold text-emerald-900 shadow-lg"
              href="/explore"
            >
              Explore Thailand
            </Link>
            <Link
              className="rounded-2xl border border-white/40 bg-white/10 px-6 py-3.5 font-bold backdrop-blur"
              href="/trips"
            >
              View trips
            </Link>
          </div>
        </div>
      </section>
      <CatalogPreview
        endpoint="/api/v1/destinations?limit=6"
        heading="Featured destinations"
        href="/explore"
        detailBaseHref="/provinces"
      />
      <CatalogPreview
        endpoint="/api/v1/attractions?limit=6"
        heading="Popular attractions"
        href="/explore"
      />
      <CatalogPreview
        endpoint="/api/v1/restaurants?limit=6"
        heading="Recommended restaurants"
        href="/food"
      />
      <CatalogPreview
        endpoint="/api/v1/foods?limit=6"
        heading="Local specialties"
        href="/food"
      />
      <CatalogPreview
        endpoint="/api/v1/events?limit=6"
        heading="Upcoming festivals"
        href="/events"
      />
      <section className="grid gap-5 md:grid-cols-2">
        <Link
          className="rounded-3xl bg-emerald-900 p-7 text-white shadow-[var(--shadow-card)]"
          href="/assistant"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-200">
            AI travel assistant
          </p>
          <h2 className="mt-3 text-2xl font-bold">Grounded answers, when enabled</h2>
          <p className="mt-3 text-emerald-100">
            The assistant uses only eligible catalog records and remains safely disabled
            until an approved provider is configured.
          </p>
        </Link>
        <Link
          className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-[var(--shadow-card)]"
          href="/trips"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
            Recent trips
          </p>
          <h2 className="mt-3 text-2xl font-bold">Continue your journey</h2>
          <p className="mt-3 text-slate-600">
            Your anonymous trips remain private to this browser session.
          </p>
        </Link>
      </section>
      <Link
        className="block rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
        href="/help"
      >
        <span className="font-bold">Emergency and traveler help</span>
        <span className="mt-1 block text-sm">
          Only current, verified assistance records are shown.
        </span>
      </Link>
    </TravelerShell>
  );
}
