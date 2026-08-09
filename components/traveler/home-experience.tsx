"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  demoItems,
  demoProvince,
  demoProvinces,
} from "@/application/traveler/synthetic-content";
import {
  recommendedCategories,
  type TravelerPreferences,
} from "@/application/traveler/preferences";
import { SyntheticVisual } from "@/components/traveler/synthetic-visual";
import { Icon, type IconName } from "@/components/ui/icon";

import { useTravelerLocale } from "./locale-provider";

const copy = {
  en: {
    greeting: "Good morning",
    location: "Demo Lanna Province · synthetic",
    search: "Where do you want to explore?",
    filters: "Open Explore filters",
    heroEyebrow: "Synthetic province preview",
    heroTitle: "Demo Lanna",
    heroDescription: "A fictional northern journey shaped for calm discovery.",
    explore: "Explore now",
    plannerTitle: "Plan your trip safely",
    plannerDescription:
      "Build a deterministic itinerary with Trips. Live AI remains disabled.",
    plannerCta: "Start planning",
    mascot: "Official mascot placement slot",
    trending: "Trending destinations",
    recommended: "Recommended for you",
    nearby: "Nearby you",
    seeAll: "See all",
    demo: "Synthetic demo",
    profile: "Open travel profile",
    notifications: "Help & assistance — notifications unavailable in demo",
  },
  th: {
    greeting: "สวัสดีตอนเช้า",
    location: "จังหวัดล้านนาจำลอง · ข้อมูลสังเคราะห์",
    search: "อยากสำรวจที่ไหน",
    filters: "เปิดตัวกรองหน้าสำรวจ",
    heroEyebrow: "ตัวอย่างจังหวัดสังเคราะห์",
    heroTitle: "ล้านนาจำลอง",
    heroDescription: "เส้นทางภาคเหนือสมมติสำหรับการเดินทางอย่างสบายใจ",
    explore: "เริ่มสำรวจ",
    plannerTitle: "วางแผนทริปอย่างปลอดภัย",
    plannerDescription: "สร้างแผนแบบกำหนดผลลัพธ์ได้ ระบบ AI จริงยังไม่เปิดใช้งาน",
    plannerCta: "เริ่มวางแผน",
    mascot: "พื้นที่สำหรับมาสคอตอย่างเป็นทางการ",
    trending: "จุดหมายยอดนิยม",
    recommended: "แนะนำสำหรับคุณ",
    nearby: "ใกล้คุณ",
    seeAll: "ดูทั้งหมด",
    demo: "ข้อมูลสังเคราะห์",
    profile: "เปิดโปรไฟล์การเดินทาง",
    notifications: "ความช่วยเหลือ — การแจ้งเตือนยังไม่เปิดในโหมดตัวอย่าง",
  },
} as const;

const quickCategories: readonly {
  label: { en: string; th: string };
  icon: IconName;
  href: string;
  tone: string;
}[] = [
  {
    label: { en: "Explore", th: "สำรวจ" },
    icon: "map",
    href: "/explore",
    tone: "bg-emerald-600",
  },
  {
    label: { en: "Restaurants", th: "ร้านอาหาร" },
    icon: "food",
    href: "/thailand/northern/demo-lanna-province/restaurants",
    tone: "bg-orange-500",
  },
  {
    label: { en: "Festivals", th: "เทศกาล" },
    icon: "event",
    href: "/events",
    tone: "bg-violet-600",
  },
  {
    label: { en: "Local products", th: "ของท้องถิ่น" },
    icon: "gift",
    href: "/food",
    tone: "bg-pink-500",
  },
];

interface ProfilePreferences extends TravelerPreferences {
  readonly active?: boolean;
}

const itemPalettes = {
  attractions: "emerald",
  restaurants: "amber",
  foods: "sky",
  events: "violet",
  emergency: "emerald",
} as const;

export function HomeExperience() {
  const { locale } = useTravelerLocale();
  const t = copy[locale];
  const [preferences, setPreferences] = useState<TravelerPreferences>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/profiles", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: { data?: readonly ProfilePreferences[] }) => {
        const active = body.data?.find((profile) => profile.active);
        if (!controller.signal.aborted && active) setPreferences(active);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const recommended = useMemo(() => {
    const affinity = new Set(recommendedCategories(preferences));
    return [...demoItems]
      .filter((item) => item.category !== "emergency")
      .sort(
        (left, right) =>
          Number(affinity.has(right.category)) - Number(affinity.has(left.category)),
      );
  }, [preferences]);

  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <div className="home-reference mx-auto grid min-w-0 w-full max-w-6xl gap-5 [&>*]:min-w-0 lg:gap-7">
      <header
        className="flex items-center justify-between gap-3"
        aria-label="Home welcome"
      >
        <div className="min-w-0">
          <p className="text-xl font-black tracking-tight sm:text-2xl">
            {t.greeting} <span aria-hidden="true">👋</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-600">
            <Icon className="size-4 shrink-0 text-emerald-600" name="place" />
            {t.location}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            aria-label={t.notifications}
            className="relative grid size-11 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
            href="/help"
          >
            <Icon name="bell" />
            <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500" />
          </Link>
          <Link
            aria-label={t.profile}
            className="grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-800"
            href="/profile"
          >
            <Icon name="user" />
          </Link>
        </div>
      </header>

      <form
        action="/explore"
        className="flex min-h-14 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm"
        role="search"
      >
        <Icon className="size-5 shrink-0 text-slate-700" name="search" />
        <label className="sr-only" htmlFor="home-search">
          {t.search}
        </label>
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
          id="home-search"
          name="q"
          placeholder={t.search}
          type="search"
        />
        <Link
          aria-label={t.filters}
          className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-slate-100"
          href="/explore"
        >
          <Icon name="filter" />
        </Link>
      </form>

      <section className="home-hero relative isolate min-h-52 overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-sky-600 p-5 text-white shadow-lg sm:min-h-72 sm:p-8">
        <div className="absolute inset-0 -z-10 opacity-80" aria-hidden="true">
          <span className="absolute -right-10 -top-12 size-52 rounded-full bg-amber-300/30 blur-2xl" />
          <span className="absolute -bottom-16 left-1/3 h-40 w-80 rotate-6 rounded-[50%] border-[24px] border-emerald-300/20" />
          <span className="absolute bottom-0 right-10 h-4/5 w-px bg-white/30" />
        </div>
        <div className="flex min-h-40 max-w-lg flex-col justify-end sm:min-h-56">
          <span className="w-fit rounded-full bg-sky-950/70 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            {t.heroEyebrow}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-2 max-w-sm text-sm font-medium text-emerald-50 sm:text-base">
            {t.heroDescription}
          </p>
          <Link
            className="mt-4 inline-flex min-h-11 w-fit items-center gap-1 rounded-xl bg-emerald-700 px-4 font-bold text-white hover:bg-emerald-800"
            href={base}
          >
            {t.explore} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-slate-950/65 px-2.5 py-1 text-xs font-bold">
          1/5
        </span>
        <div
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
          aria-hidden="true"
        >
          <span className="h-1.5 w-6 rounded-full bg-white" />
          <span className="size-1.5 rounded-full bg-white/50" />
          <span className="size-1.5 rounded-full bg-white/50" />
        </div>
      </section>

      <section className="grid min-h-32 grid-cols-[1fr_7rem] items-center overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-[1fr_10rem] sm:p-6">
        <div>
          <p className="flex items-center gap-2 text-lg font-black">
            <Icon className="size-6 text-emerald-700" name="bot" />
            {t.plannerTitle}
          </p>
          <p className="mt-1 max-w-xl text-sm text-slate-600">{t.plannerDescription}</p>
          <Link
            className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white"
            href="/trips"
          >
            {t.plannerCta} ✨
          </Link>
        </div>
        <div
          aria-label={t.mascot}
          className="relative grid aspect-square place-items-center rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-800"
          role="img"
        >
          <Icon className="size-10" name="bot" />
          <span className="absolute -bottom-2 rounded-full bg-white px-2 py-1 text-[0.6rem] font-bold uppercase shadow-sm">
            Slot only
          </span>
        </div>
      </section>

      <nav aria-label="Quick categories">
        <ul className="grid grid-cols-4 gap-2 sm:gap-3">
          {quickCategories.map((category) => (
            <li key={category.href}>
              <Link
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-1 text-center text-[0.7rem] font-bold shadow-sm sm:text-sm"
                href={category.href}
              >
                <span
                  className={`grid size-10 place-items-center rounded-xl text-white ${category.tone}`}
                >
                  <Icon name={category.icon} />
                </span>
                <span className="leading-tight">{category.label[locale]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <HomeRail title={t.trending} seeAll={t.seeAll} href="/explore">
        {demoProvinces.map((province) => (
          <Link
            className="home-rail-card"
            href={province.name === "Demo Lanna" ? base : "/explore"}
            key={province.name}
          >
            <SyntheticVisual
              className="absolute inset-0"
              label={`${province.name} · ${t.demo}`}
              palette={province.palette}
            />
            <CardCaption title={province.name} subtitle={t.demo} />
          </Link>
        ))}
      </HomeRail>

      <HomeRail title={t.recommended} seeAll={t.seeAll} href="/explore">
        {recommended.slice(0, 5).map((item) => (
          <HomeItemCard base={base} item={item} key={item.id} subtitle={t.demo} />
        ))}
      </HomeRail>

      <HomeRail title={t.nearby} seeAll={t.seeAll} href="/explore">
        {recommended.slice(1, 6).map((item, index) => (
          <HomeItemCard
            base={base}
            item={item}
            key={item.id}
            subtitle={`${200 + index * 150} m · ${t.demo}`}
          />
        ))}
      </HomeRail>
    </div>
  );
}

function HomeRail({
  title,
  seeAll,
  href,
  children,
}: {
  title: string;
  seeAll: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0" aria-labelledby={`home-${title.replaceAll(" ", "-")}`}>
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-lg font-black sm:text-2xl"
          id={`home-${title.replaceAll(" ", "-")}`}
        >
          {title}
        </h2>
        <Link
          className="inline-flex min-h-11 items-center text-sm font-bold text-slate-600"
          href={href}
        >
          {seeAll} <span aria-hidden="true">›</span>
        </Link>
      </div>
      <div className="home-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {children}
      </div>
    </section>
  );
}

function HomeItemCard({
  item,
  base,
  subtitle,
}: {
  item: (typeof demoItems)[number];
  base: string;
  subtitle: string;
}) {
  return (
    <Link className="home-rail-card" href={`${base}/${item.category}/${item.slug}`}>
      <SyntheticVisual
        className="absolute inset-0"
        label={`${item.name} · synthetic visual`}
        palette={itemPalettes[item.category]}
      />
      <CardCaption title={item.name} subtitle={subtitle} />
    </Link>
  );
}

function CardCaption({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent px-3 pb-3 pt-10 text-white">
      <strong className="block truncate text-sm">{title}</strong>
      <small className="mt-0.5 block truncate text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-100">
        {subtitle}
      </small>
    </span>
  );
}
