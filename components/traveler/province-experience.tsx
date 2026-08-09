import Link from "next/link";

import {
  categoryLabels,
  demoItems,
  demoProvince,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import {
  Badge,
  ContentCard,
  LinkButton,
  SyntheticNotice,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";
import { DemoCard } from "./demo-card";
import { SyntheticVisual } from "./synthetic-visual";

const categories: DemoCategory[] = ["attractions", "restaurants", "events", "foods"];

export function ProvinceExperience() {
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <>
      <SyntheticNotice />
      <section className="relative isolate min-h-[26rem] overflow-hidden rounded-[2rem] bg-emerald-950 text-white shadow-[var(--shadow-card)]">
        <div className="absolute inset-0 opacity-70">
          <SyntheticVisual
            className="h-full"
            icon="place"
            label="Synthetic province atmosphere"
            palette="emerald"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/55 to-transparent" />
        <div className="relative flex min-h-[26rem] flex-col justify-end p-6 sm:p-10">
          <Badge tone="warning">Evidence pending</Badge>
          <p className="mt-4 text-sm font-bold uppercase tracking-[.2em] text-emerald-100">
            Northern Thailand · synthetic province
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-tight sm:text-7xl">
            {demoProvince.name}
          </h1>
          <p className="mt-2 text-emerald-100" lang="th">
            {demoProvince.thaiName}
          </p>
          <p className="mt-4 max-w-2xl text-lg text-emerald-50">
            {demoProvince.introduction}
          </p>
        </div>
      </section>
      <section aria-labelledby="province-actions">
        <h2 className="text-2xl font-black" id="province-actions">
          Explore the province
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              className="flex min-h-24 flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-4 font-bold shadow-sm hover:bg-emerald-50"
              href={`${base}/${category}`}
              key={category}
            >
              <Icon
                className="size-7 text-emerald-700"
                name={
                  category === "restaurants" || category === "foods"
                    ? "food"
                    : category === "events"
                      ? "event"
                      : "place"
                }
              />
              {category === "foods" ? "Local products" : categoryLabels[category]}
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <ContentCard>
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700">
            Province highlights
          </h2>
          <p className="mt-2 text-3xl font-black">A thoughtful demo guide</p>
          <p className="mt-3 text-slate-600">
            This layout is production-shaped without making real claims. Highlights
            remain synthetic and clearly separated from evidence-approved publication.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-slate-500">Featured places</dt>
              <dd className="text-3xl font-black">{demoItems.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Verified real records</dt>
              <dd className="text-3xl font-black">0</dd>
            </div>
          </dl>
        </ContentCard>
        <ContentCard className="overflow-hidden p-0">
          <SyntheticVisual
            className="min-h-64 h-full"
            icon="map"
            label="Future illustrated province map"
            palette="sky"
          />
        </ContentCard>
      </section>
      <section>
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-2xl font-black">
            Featured in {demoProvince.name}
          </h2>
          <Link
            className="inline-flex min-h-11 flex-none items-center font-bold text-emerald-700"
            href={`${base}/attractions`}
          >
            View all →
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {demoItems.slice(0, 4).map((item) => (
            <li key={item.id}>
              <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ContentCard>
          <Icon className="size-8 text-emerald-700" name="place" />
          <h2 className="mt-3 text-xl font-black">Nearby discovery</h2>
          <p className="mt-2 text-slate-600">
            Location-aware results require consent and verified records.
          </p>
          <LinkButton className="mt-5" href="/explore">
            Explore nearby structure
          </LinkButton>
        </ContentCard>
        <ContentCard>
          <Icon className="size-8 text-emerald-700" name="map" />
          <h2 className="mt-3 text-xl font-black">External navigation only</h2>
          <p className="mt-2 text-slate-600">
            Directions hand off to trusted map providers. No internal navigation engine
            is built.
          </p>
          <LinkButton className="mt-5" href="/explore" variant="secondary">
            Map handoff information
          </LinkButton>
        </ContentCard>
      </section>
    </>
  );
}
