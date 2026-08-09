import Link from "next/link";

import {
  categoryLabels,
  demoItems,
  demoProvince,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import { Badge, ContentCard, SyntheticNotice } from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";
import { DemoCard } from "./demo-card";
import { SyntheticVisual } from "./synthetic-visual";
import { TravelerActions } from "./traveler-actions";

export function DetailExperience({
  item,
}: {
  readonly item: {
    readonly id: string;
    readonly name: string;
    readonly thaiName: string;
    readonly summary: string;
    readonly meta: string;
    readonly category: DemoCategory;
  };
}) {
  const emergency = item.category === "emergency";
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  const related = demoItems
    .filter(
      (candidate) => candidate.id !== item.id && candidate.category !== "emergency",
    )
    .slice(0, 3);
  return (
    <>
      <SyntheticNotice />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/explore">Explore</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`${base}/${item.category}`}>{categoryLabels[item.category]}</Link>{" "}
        <span aria-hidden="true">/</span> {item.name}
      </nav>
      <section className="grid gap-3 lg:grid-cols-[1.55fr_.75fr]">
        <SyntheticVisual
          className="min-h-72 rounded-[2rem] lg:min-h-[28rem]"
          icon={emergency ? "help" : item.category === "restaurants" ? "food" : "place"}
          label={`${item.name} hero gallery`}
          palette={emergency ? "amber" : "emerald"}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <SyntheticVisual
            className="min-h-36 rounded-[2rem]"
            label="Gallery angle 2"
            palette="sky"
          />
          <SyntheticVisual
            className="min-h-36 rounded-[2rem]"
            label="Gallery angle 3"
            palette="violet"
          />
        </div>
      </section>
      <header>
        <div className="flex flex-wrap gap-2">
          <Badge tone={emergency ? "danger" : "info"}>Synthetic demo</Badge>
          <Badge tone="warning">Evidence pending</Badge>
        </div>
        <p className="mt-4 text-sm font-bold uppercase tracking-wider text-emerald-700">
          {categoryLabels[item.category]}
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl">
          {item.name}
        </h1>
        <p className="mt-1 text-slate-500" lang="th">
          {item.thaiName}
        </p>
        <p className="mt-5 max-w-3xl text-lg text-slate-600">{item.summary}</p>
      </header>
      {emergency ? (
        <div
          className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"
          role="alert"
        >
          <p className="font-black">Not a real emergency service</p>
          <p className="mt-1 text-sm">Phone, map and contact actions are suppressed.</p>
        </div>
      ) : null}
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <ContentCard>
          <h2 className="text-2xl font-black">About this place</h2>
          <p className="mt-3 text-slate-600">{item.summary}</p>
          <h3 className="mt-7 font-black">Quick facts</h3>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <Fact label="Opening hours" value="Unknown · verification required" />
            <Fact label="Price" value={item.meta} />
            <Fact label="Contact" value="Not available in demo" />
            <Fact label="Website" value="No verified first-party URL" />
          </dl>
        </ContentCard>
        <ContentCard>
          <h2 className="text-2xl font-black">Plan your visit</h2>
          <div className="mt-4 grid min-h-44 place-items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 text-center">
            <div>
              <Icon className="mx-auto size-10 text-emerald-700" name="map" />
              <p className="mt-2 font-bold">External map handoff</p>
              <p className="text-sm text-slate-600">
                Coordinates are synthetic; trusted provider dialog only.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <TravelerActions emergency={emergency} placeId={item.id} />
          </div>
        </ContentCard>
      </section>
      <section>
        <h2 className="text-2xl font-black">Nearby & related</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((candidate) => (
            <li key={candidate.id}>
              <DemoCard
                href={`${base}/${candidate.category}/${candidate.slug}`}
                item={candidate}
              />
            </li>
          ))}
        </ul>
      </section>
      <ContentCard>
        <h2 className="text-xl font-black">Trust and provenance</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Fact label="Publication state" value="Development-only synthetic" />
          <Fact label="Source" value="Synthetic M2 fixture" />
          <Fact label="Last verified" value="Not applicable" />
          <Fact label="Media rights" value="No real media attached" />
        </dl>
      </ContentCard>
    </>
  );
}

function Fact({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="font-bold">{label}</dt>
      <dd className="mt-1 text-slate-600">{value}</dd>
    </div>
  );
}
