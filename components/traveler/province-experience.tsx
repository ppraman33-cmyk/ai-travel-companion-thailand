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
  HeroShell,
  LinkButton,
  QuickActionGrid,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

import { DemoCard } from "./demo-card";

const categories: DemoCategory[] = ["attractions", "restaurants", "foods", "events"];

export function ProvinceExperience() {
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <>
      <SyntheticNotice />
      <HeroShell
        eyebrow="Northern Thailand · synthetic route"
        title={demoProvince.name}
        description={demoProvince.introduction}
      >
        <Badge tone="warning">Evidence pending</Badge>
        <span className="text-sm text-emerald-100" lang="th">
          {demoProvince.thaiName}
        </span>
      </HeroShell>
      <section aria-labelledby="quick-actions">
        <h2 className="text-2xl font-bold" id="quick-actions">
          Explore this province
        </h2>
        <QuickActionGrid>
          {categories.map((category) => (
            <Link
              className="flex min-h-24 flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-4 font-bold text-emerald-950 shadow-sm hover:bg-emerald-50"
              href={`${base}/${category}`}
              key={category}
            >
              <Icon
                name={
                  category === "restaurants" || category === "foods"
                    ? "food"
                    : category === "events"
                      ? "event"
                      : "place"
                }
              />
              <span>{categoryLabels[category]}</span>
            </Link>
          ))}
        </QuickActionGrid>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <ContentCard>
          <Badge tone="info">Media slot</Badge>
          <h2 className="mt-3 text-2xl font-bold">Province infographic</h2>
          <div className="mt-5 grid min-h-48 place-items-center rounded-2xl bg-emerald-50 text-center text-sm text-emerald-900">
            Rights-reviewed infographic will appear here.
            <br />
            No real geography is represented.
          </div>
        </ContentCard>
        <ContentCard>
          <Badge tone="info">Map slot</Badge>
          <h2 className="mt-3 text-2xl font-bold">Illustrated interactive map</h2>
          <div className="mt-5 grid min-h-48 place-items-center rounded-2xl border border-dashed border-emerald-200 bg-white text-center text-sm text-slate-600">
            <Icon className="mb-2 size-10 text-emerald-700" name="map" />
            Geography and image rights pending
          </div>
        </ContentCard>
      </section>
      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured demo content</h2>
          <Link className="font-bold text-emerald-700" href={`${base}/attractions`}>
            View categories
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
      <ContentCard className="border-red-200 bg-red-50">
        <Badge tone="danger">Emergency safety</Badge>
        <h2 className="mt-3 text-2xl font-bold text-red-950">Verified help only</h2>
        <p className="mt-2 text-red-900">
          Demo emergency records never expose call or map actions. Real services require
          current verification before publication.
        </p>
        <LinkButton className="mt-5" href="/help" variant="danger">
          Open Help & emergency
        </LinkButton>
      </ContentCard>
      <StatusState
        description="This state is intentionally available until lawful, verified province evidence is approved."
        state="empty"
        title="Evidence-pending content is never invented"
      />
    </>
  );
}
