import Link from "next/link";

import {
  demoItems,
  demoProvince,
  demoProvinces,
} from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import { OnboardingGate } from "@/components/traveler/onboarding-gate";
import { SyntheticVisual } from "@/components/traveler/synthetic-visual";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  Badge,
  ContentCard,
  LinkButton,
  SyntheticNotice,
} from "@/components/ui/design-system";
import { Icon, type IconName } from "@/components/ui/icon";

const quickActions: readonly {
  label: string;
  icon: IconName;
  href: string;
  tone: string;
}[] = [
  {
    label: "Explore",
    icon: "map",
    href: "/explore",
    tone: "bg-emerald-50 text-emerald-800",
  },
  {
    label: "Restaurants",
    icon: "food",
    href: "/food",
    tone: "bg-orange-50 text-orange-700",
  },
  {
    label: "Festivals",
    icon: "event",
    href: "/events",
    tone: "bg-violet-50 text-violet-700",
  },
  {
    label: "Trips",
    icon: "trip",
    href: "/trips",
    tone: "bg-sky-50 text-sky-800",
  },
];

export default function HomePage() {
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <TravelerShell>
      <SyntheticNotice />
      <OnboardingGate>
        <section className="relative isolate min-h-[27rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-500 p-6 text-white shadow-[var(--shadow-card)] sm:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 -z-10 w-3/5 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,.28),transparent_45%)]"
          />
          <div className="flex min-h-[22rem] max-w-2xl flex-col justify-end">
            <Badge tone="warning">Synthetic province preview</Badge>
            <p className="mt-4 text-sm font-bold uppercase tracking-[.2em] text-emerald-100">
              Demo location · no real-world claim
            </p>
            <h1 className="mt-2 text-5xl font-black tracking-tight sm:text-7xl">
              Explore Thailand with confidence.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-emerald-50">
              Local culture, thoughtful planning and safety-first travel tools in one
              calm companion.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LinkButton className="!bg-white !text-emerald-950" href="/explore">
                Explore now
              </LinkButton>
              <LinkButton
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                href="/welcome"
                variant="secondary"
              >
                Welcome screen
              </LinkButton>
            </div>
          </div>
        </section>

        <section aria-labelledby="home-actions-title">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-black" id="home-actions-title">
              Start your journey
            </h2>
            <Badge tone="info">Demo only</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                className={`flex min-h-28 flex-col justify-between rounded-2xl border border-white p-4 font-bold shadow-sm ${action.tone}`}
                href={action.href}
                key={action.label}
              >
                <Icon className="size-7" name={action.icon} />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="traveler-services-title"
          className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]"
        >
          <ContentCard className="relative overflow-hidden !bg-emerald-950 text-white">
            <div className="max-w-md">
              <Icon className="size-8 text-emerald-200" name="spark" />
              <p className="mt-4 text-sm font-bold uppercase tracking-wider text-emerald-200">
                AI trip companion
              </p>
              <h2 className="mt-2 text-3xl font-black" id="traveler-services-title">
                Recommendations grounded in deterministic records.
              </h2>
              <p className="mt-3 text-emerald-100">
                Live AI remains disabled. Explore, Saved and Trips continue without a
                live provider.
              </p>
              <LinkButton className="mt-5" href="/assistant" variant="secondary">
                View assistant status
              </LinkButton>
            </div>
          </ContentCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ContentCard className="!border-red-200 !bg-red-700 text-white">
              <Icon className="size-8" name="help" />
              <h3 className="mt-3 text-xl font-black">SOS</h3>
              <p className="mt-1 text-sm text-red-100">
                Emergency actions are disabled until verified records are available.
              </p>
              <button
                aria-disabled="true"
                className="mt-4 min-h-11 cursor-not-allowed rounded-xl border border-white/40 px-4 font-bold opacity-75"
                disabled
                type="button"
              >
                SOS unavailable in demo
              </button>
              <Link
                className="mt-3 inline-flex min-h-11 items-center font-bold underline"
                href="/help"
              >
                Open Help information
              </Link>
            </ContentCard>
            <ContentCard className="!border-amber-200 !bg-amber-200 text-emerald-950">
              <Icon className="size-8" name="car" />
              <h3 className="mt-3 text-xl font-black">Service Car</h3>
              <p className="mt-1 text-sm">
                Planning placeholder only. No real service or partner handoff is active.
              </p>
              <button
                aria-disabled="true"
                className="mt-4 min-h-11 cursor-not-allowed rounded-xl border border-emerald-900/30 px-4 font-bold opacity-70"
                disabled
                type="button"
              >
                Coming later
              </button>
            </ContentCard>
          </div>
        </section>

        <Showcase title="Featured provinces" link="/explore">
          {demoProvinces.map((province) => (
            <Link
              className="min-w-52 flex-1 overflow-hidden rounded-2xl bg-white shadow-sm"
              href={province.name === "Demo Lanna" ? base : "/explore"}
              key={province.name}
            >
              <SyntheticVisual
                className="aspect-[4/3]"
                label={`${province.name} · ${province.region} · synthetic`}
                palette={province.palette}
              />
              <div className="p-4">
                <h3 className="font-black">{province.name}</h3>
                <p className="text-sm text-slate-500" lang="th">
                  {province.thaiName}
                </p>
              </div>
            </Link>
          ))}
        </Showcase>
        <Showcase title="Featured attractions" link={`${base}/attractions`}>
          <Cards
            items={demoItems.filter(
              (item) =>
                item.category === "attractions" || item.category === "restaurants",
            )}
            base={base}
          />
        </Showcase>
        <Showcase title="Festivals & local specialties" link="/events">
          <Cards
            items={demoItems.filter(
              (item) => item.category === "events" || item.category === "foods",
            )}
            base={base}
          />
        </Showcase>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Traveler tools">
          <LinkButton href="/saved" variant="secondary">
            Saved places
          </LinkButton>
          <LinkButton href="/profile" variant="secondary">
            Travel profile
          </LinkButton>
          <LinkButton href="/help" variant="secondary">
            Help &amp; assistance
          </LinkButton>
        </section>
      </OnboardingGate>
    </TravelerShell>
  );
}

function Showcase({
  title,
  link,
  children,
}: {
  readonly title: string;
  readonly link: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-2xl font-black">{title}</h2>
        <Link
          className="inline-flex min-h-11 flex-none items-center font-bold text-emerald-700"
          href={link}
        >
          See all →
        </Link>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-3">{children}</div>
    </section>
  );
}

function Cards({
  items,
  base,
}: {
  readonly items: readonly (typeof demoItems)[number][];
  readonly base: string;
}) {
  return (
    <>
      {items.map((item) => (
        <div className="min-w-[17rem] max-w-sm flex-1" key={item.id}>
          <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
        </div>
      ))}
    </>
  );
}
