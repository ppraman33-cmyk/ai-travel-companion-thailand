"use client";

import { useEffect, useState } from "react";

import {
  recommendedCategories,
  type TravelerPreferences,
} from "@/application/traveler/preferences";
import { categoryLabels, demoItems, demoProvince, type DemoCategory } from "@/application/traveler/synthetic-content";
import { Badge } from "@/components/ui/design-system";

export function ExploreRecommendations() {
  const [prefs, setPrefs] = useState<TravelerPreferences>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/preferences", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body: { data: TravelerPreferences }) => {
        if (!controller.signal.aborted) setPrefs(body.data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const recommended = recommendedCategories(prefs);
  if (recommended.length === 0) return null;

  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  const recommendedItems = demoItems.filter(
    (item) => item.category !== "emergency" && recommended.includes(item.category),
  );

  return (
    <section>
      <div className="flex items-center gap-2">
        <Badge tone="success">For you</Badge>
        <h2 className="text-2xl font-bold">Recommended based on your preferences</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Matching your travel style: {categoryLabels[recommended[0] as DemoCategory]}
        {recommended.length > 1 ? ` and ${recommended.length - 1} more` : ""}.
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recommendedItems.map((item) => (
          <li
            className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
            key={item.id}
          >
            <a
              className="block font-bold text-emerald-900 hover:underline"
              href={`${base}/${item.category}/${item.slug}`}
            >
              {item.name}
            </a>
            <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
            <p className="mt-2 text-xs font-bold text-emerald-700">{item.meta}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
