import Link from "next/link";

import { demoItems, demoProvince } from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  Badge,
  ContentCard,
  HeroShell,
  LinkButton,
  QuickActionGrid,
  SyntheticNotice,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

export default function HomePage() {
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  const actions = [
    { label: "Attractions", icon: "place", href: `${base}/attractions` },
    { label: "Local food", icon: "food", href: `${base}/foods` },
    { label: "Events", icon: "event", href: `${base}/events` },
    { label: "Help", icon: "help", href: "/help" },
  ] as const;
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        eyebrow="Free traveler companion · synthetic preview"
        title="Thailand, thoughtfully explored"
        description="Plan, discover local culture and find safety-first assistance through evidence-gated traveler experiences."
      >
        <LinkButton href="/explore" variant="secondary">
          Explore Thailand
        </LinkButton>
        <LinkButton
          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
          href="/trips"
          variant="secondary"
        >
          Plan a trip
        </LinkButton>
      </HeroShell>
      <section aria-labelledby="quick-title">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold" id="quick-title">
            What would you like to explore?
          </h2>
          <Badge tone="info">Synthetic only</Badge>
        </div>
        <QuickActionGrid>
          {actions.map((action) => (
            <Link
              className={`mt-4 flex min-h-24 flex-col justify-between rounded-2xl border p-4 font-bold shadow-sm ${action.icon === "help" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-100 bg-white text-emerald-950 hover:bg-emerald-50"}`}
              href={action.href}
              key={action.label}
            >
              <Icon name={action.icon} />
              <span>{action.label}</span>
            </Link>
          ))}
        </QuickActionGrid>
      </section>
      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
              Reference-aligned discovery
            </p>
            <h2 className="mt-1 text-2xl font-bold">Ideas for your demo journey</h2>
          </div>
          <Link className="font-bold text-emerald-700" href="/explore">
            View all
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {demoItems.slice(0, 3).map((item) => (
            <li key={item.id}>
              <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ContentCard className="!bg-emerald-950 text-white">
          <Icon className="size-8 text-emerald-200" name="spark" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wider text-emerald-200">
            AI assistant
          </p>
          <h2 className="mt-2 text-2xl font-bold">Safely disabled by default</h2>
          <p className="mt-2 text-emerald-100">
            Manual Explore, Saved and Trips continue without a live AI provider.
          </p>
          <LinkButton className="mt-5" href="/assistant" variant="secondary">
            View AI status
          </LinkButton>
        </ContentCard>
        <ContentCard>
          <Icon className="size-8 text-emerald-700" name="trip" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wider text-emerald-700">
            Anonymous trips
          </p>
          <h2 className="mt-2 text-2xl font-bold">Plan without an account</h2>
          <p className="mt-2 text-slate-600">
            Trip ownership remains tied to the secure anonymous browser session.
          </p>
          <LinkButton className="mt-5" href="/trips">
            Open Trips
          </LinkButton>
        </ContentCard>
      </section>
      <Link
        className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950"
        href="/help"
      >
        <span>
          <strong className="block">Help & emergency</strong>
          <span className="text-sm">
            Only current verified actions may be enabled. Demo actions stay suppressed.
          </span>
        </span>
        <Icon className="size-6 shrink-0" name="arrow" />
      </Link>
    </TravelerShell>
  );
}
