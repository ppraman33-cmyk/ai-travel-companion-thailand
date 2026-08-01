import { CatalogPreview } from "@/components/traveler/catalog-preview";
import { CatalogSearch } from "@/components/traveler/catalog-search";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function ExplorePage() {
  return (
    <TravelerShell>
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Nationwide guide
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Explore Thailand
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Browse eligible province guides and verified local content across Thailand.
        </p>
      </section>
      <CatalogSearch />
      <CatalogPreview
        endpoint="/api/v1/destinations?limit=50"
        heading="Province guides"
        href="/explore"
        detailBaseHref="/provinces"
      />
      <CatalogPreview
        endpoint="/api/v1/attractions?limit=20"
        heading="Attractions"
        href="/explore"
      />
      <CatalogPreview
        endpoint="/api/v1/restaurants?limit=20"
        heading="Restaurants"
        href="/food"
      />
    </TravelerShell>
  );
}
