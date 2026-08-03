"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  recommendedCategories,
  type TravelerPreferences,
} from "@/application/traveler/preferences";
import { demoItems, demoProvince } from "@/application/traveler/synthetic-content";
import {
  Badge,
  Button,
  ContentCard,
  StatusState,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

interface SavedRecord {
  readonly placeId: string;
  readonly tripId?: string;
}

type SavedState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly items: readonly SavedRecord[] }
  | { readonly status: "unavailable" };

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

const detailHref = (placeId: string): string | undefined => {
  const item = demoItems.find((entry) => entry.id === placeId);
  if (!item) return undefined;
  return `/thailand/${demoProvince.region}/${demoProvince.slug}/${item.category}/${item.slug}`;
};

const resolveDemoItem = (placeId: string) =>
  demoItems.find((entry) => entry.id === placeId);

export function SavedClient() {
  const [state, setState] = useState<SavedState>({ status: "loading" });
  const [prefs, setPrefs] = useState<TravelerPreferences>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/saved-places", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: { data: readonly SavedRecord[] }) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", items: body.data });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ status: "unavailable" });
      });
    fetch("/api/v1/preferences", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body: { data: TravelerPreferences }) => {
        if (!controller.signal.aborted) setPrefs(body.data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  async function remove(placeId: string) {
    const response = await fetch(`/api/v1/saved-places/${placeId}`, {
      method: "DELETE",
      headers: { "x-csrf-token": readCookie("atct_csrf") ?? "" },
    });
    if (response.ok) {
      setState((prev) =>
        prev.status === "ready"
          ? {
              status: "ready",
              items: prev.items.filter((item) => item.placeId !== placeId),
            }
          : prev,
      );
    }
  }

  const recommended = recommendedCategories(prefs);
  const recommendedItems = recommended.length
    ? demoItems.filter(
        (item) =>
          item.category !== "emergency" && recommended.includes(item.category),
      )
    : [];
  const savedIds = state.status === "ready"
    ? new Set(state.items.map((i) => i.placeId))
    : new Set<string>();
  const suggestions = recommendedItems.filter((i) => !savedIds.has(i.id));

  if (state.status === "loading")
    return (
      <StatusState
        state="loading"
        title="Loading your saved places"
        description="Checking anonymous-session ownership…"
      />
    );
  if (state.status === "unavailable")
    return (
      <StatusState
        state="error"
        title="Saved places are unavailable"
        description="Browse still works. Nothing is stored outside the secure session service."
      />
    );

  return (
    <div className="grid gap-5">
      {state.items.length === 0 ? (
        <StatusState
          state="empty"
          title="No saved places yet"
          description="Save a verified or synthetic demo place to find it here."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {state.items.map((item) => {
            const demo = resolveDemoItem(item.placeId);
            const href = detailHref(item.placeId);
            const emergency = demo?.category === "emergency";
            return (
              <li key={item.placeId}>
                <ContentCard
                  className={`group relative flex h-full flex-col p-0 ${emergency ? "border-red-200" : ""}`}
                >
                  <div
                    className={`grid aspect-[16/9] place-items-center ${emergency ? "bg-red-50 text-red-700" : "bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 text-emerald-800"}`}
                  >
                    <Icon className="size-10" name={emergency ? "help" : "heart"} />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-2">
                      {demo ? (
                        <Badge tone={emergency ? "danger" : "info"}>Synthetic demo</Badge>
                      ) : (
                        <Badge tone="neutral">Session-owned Place</Badge>
                      )}
                      {item.tripId ? (
                        <Badge tone="success">Added to a trip</Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-lg font-bold">
                      {href ? (
                        <Link className="after:absolute after:inset-0" href={href}>
                          {demo?.name ?? item.placeId}
                        </Link>
                      ) : (
                        <span className="break-all">{item.placeId}</span>
                      )}
                    </h2>
                    {demo?.thaiName ? (
                      <p className="text-sm text-slate-500" lang="th">
                        {demo.thaiName}
                      </p>
                    ) : null}
                    {demo?.summary ? (
                      <p className="mt-3 flex-1 text-sm text-slate-600">
                        {demo.summary}
                      </p>
                    ) : (
                      <p className="mt-3 flex-1 text-sm text-slate-600">
                        Catalog details are resolved through the public API when eligible.
                      </p>
                    )}
                    {demo?.meta ? (
                      <p
                        className={`mt-4 text-xs font-bold ${emergency ? "text-red-700" : "text-emerald-700"}`}
                      >
                        {demo.meta}
                      </p>
                    ) : null}
                    <div className="relative z-10 mt-4">
                      <Button
                        onClick={() => remove(item.placeId)}
                        variant="secondary"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </ContentCard>
              </li>
            );
          })}
        </ul>
      )}

      {suggestions.length > 0 ? (
        <ContentCard>
          <div className="flex items-center gap-2">
            <Icon name="spark" />
            <h2 className="text-lg font-bold">Recommended for you</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Based on your travel style preferences.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {suggestions.map((item) => {
              const href = `/thailand/${demoProvince.region}/${demoProvince.slug}/${item.category}/${item.slug}`;
              return (
                <li
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300"
                  key={item.id}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Icon name="place" />
                  </span>
                  <Link className="min-w-0 flex-1" href={href}>
                    <strong className="block truncate">{item.name}</strong>
                    <small className="text-slate-500">{item.summary}</small>
                  </Link>
                </li>
              );
            })}
          </ul>
        </ContentCard>
      ) : null}

      {state.items.length === 0 ? (
        <div className="flex justify-center">
          <Button onClick={() => window.location.assign("/explore")}>
            Explore demo content
          </Button>
        </div>
      ) : null}
    </div>
  );
}
