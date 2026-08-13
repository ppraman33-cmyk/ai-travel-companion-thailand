import Link from "next/link";

import {
  demoItems,
  demoProvince,
  demoProvinces,
} from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import { SyntheticVisual } from "@/components/traveler/synthetic-visual";
import { PageHeader, SyntheticNotice } from "@/components/ui/design-system";

const regions = [
  "Northern",
  "Northeastern",
  "Central",
  "Eastern",
  "Western",
  "Southern",
];

export function DiscoveryDirectory({
  kind,
}: {
  readonly kind: "thailand" | "regions" | "provinces";
}) {
  const titles = {
    thailand: "Discover Thailand",
    regions: "Explore by region",
    provinces: "Province directory",
  };
  return (
    <div className="reference-page">
      <SyntheticNotice>
        DEMO MODE — directory structure only; no reference-map facts are published.
      </SyntheticNotice>
      <PageHeader
        eyebrow="Verified structure · synthetic preview"
        title={titles[kind]}
        description="Explore the approved application hierarchy while nationwide records remain evidence-gated."
      />
      <form
        action="/explore"
        className="reference-card grid min-h-14 min-w-0 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        role="search"
      >
        <label className="sr-only" htmlFor={`${kind}-search`}>
          Search directory
        </label>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl px-3"
          id={`${kind}-search`}
          name="q"
          placeholder="Search synthetic previews"
        />
        <button className="w-full rounded-xl bg-emerald-800 px-4 font-bold text-white sm:w-auto">
          Search
        </button>
      </form>
      {kind === "thailand" ? (
        <SyntheticVisual
          className="min-h-72 rounded-3xl"
          icon="map"
          label="Thailand discovery structure · no geographic claim"
          palette="sky"
        />
      ) : null}
      {kind !== "provinces" ? (
        <section aria-labelledby="region-title">
          <h2 className="text-2xl font-black" id="region-title">
            Six-region application taxonomy
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {regions.map((region) => (
              <Link
                className="reference-card min-h-28 p-4 font-black hover:bg-emerald-50"
                href="/thailand/provinces"
                key={region}
              >
                {region}
                <span className="mt-2 block text-xs font-medium text-slate-500">
                  Verified totals unavailable · synthetic discovery
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="province-title">
          <h2 className="text-2xl font-black" id="province-title">
            Synthetic province previews
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {demoProvinces.map((province) => (
              <Link
                className="reference-card p-5 font-black"
                href={
                  province.name === "Demo Lanna"
                    ? `/thailand/${demoProvince.region}/${demoProvince.slug}`
                    : "/explore"
                }
                key={province.name}
              >
                {province.name}
                <span className="block text-sm font-normal text-slate-500" lang="th">
                  {province.thaiName} · synthetic
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            The production directory remains suppressed until publication-eligible
            records cover the verified 77-province contract.
          </p>
        </section>
      )}
      {kind === "thailand" ? (
        <section>
          <h2 className="text-2xl font-black">Preview journeys</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoItems
              .filter((item) => item.category !== "emergency")
              .slice(0, 3)
              .map((item) => (
                <li key={item.id}>
                  <DemoCard
                    href={`/thailand/${demoProvince.region}/${demoProvince.slug}/${item.category}/${item.slug}`}
                    item={item}
                  />
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
