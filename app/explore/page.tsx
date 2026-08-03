import Link from "next/link";

import {
  categoryLabels,
  demoItems,
  demoProvince,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import { ExploreRecommendations } from "@/components/traveler/explore-recommendations";
import { DemoCard } from "@/components/traveler/demo-card";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  CategoryChip,
  HeroShell,
  SyntheticNotice,
} from "@/components/ui/design-system";

export default function ExplorePage() {
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Thailand / Explore"
        title="Find your next meaningful stop"
        description="Search and browse responsive synthetic catalog patterns while real publication remains evidence-gated."
      />
      <form action="/explore" className="relative" role="search">
        <label className="sr-only" htmlFor="explore-search">
          Search demo content
        </label>
        <input
          className="min-h-14 w-full rounded-2xl border border-emerald-100 bg-white px-5 pr-28 text-base shadow-sm"
          id="explore-search"
          name="q"
          placeholder="Search synthetic places, food or events…"
          type="search"
        />
        <button
          className="absolute bottom-1.5 right-1.5 top-1.5 rounded-xl bg-emerald-800 px-5 font-bold text-white"
          type="submit"
        >
          Search
        </button>
      </form>
      <nav aria-label="Explore categories" className="flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(categoryLabels) as DemoCategory[]).map((category) => (
          <CategoryChip href={`${base}/${category}`} key={category}>
            {categoryLabels[category]}
          </CategoryChip>
        ))}
      </nav>
      <ExploreRecommendations />
      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              Northern · synthetic region
            </p>
            <h2 className="text-2xl font-bold">{demoProvince.name}</h2>
          </div>
          <Link className="font-bold text-emerald-700" href={base}>
            Province guide
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {demoItems.map((item) => (
            <li key={item.id}>
              <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
            </li>
          ))}
        </ul>
      </section>
    </TravelerShell>
  );
}
