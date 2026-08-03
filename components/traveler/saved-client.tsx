"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  if (state.items.length === 0)
    return (
      <>
        <StatusState
          state="empty"
          title="No saved places yet"
          description="Save a verified or synthetic demo place to find it here."
        />
        <div className="flex justify-center">
          <Button onClick={() => window.location.assign("/explore")}>
            Explore demo content
          </Button>
        </div>
      </>
    );
  return (
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
  );
}
