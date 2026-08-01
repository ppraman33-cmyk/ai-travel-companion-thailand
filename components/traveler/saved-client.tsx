"use client";

import { useEffect, useState } from "react";

import { Button, ContentCard, StatusState } from "@/components/ui/design-system";

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

export function SavedClient() {
  const [state, setState] = useState<SavedState>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/saved-places", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: { data: readonly SavedRecord[] }) =>
        setState({ status: "ready", items: body.data }),
      )
      .catch(() => setState({ status: "unavailable" }));
    return () => controller.abort();
  }, []);

  async function remove(placeId: string) {
    const response = await fetch(`/api/v1/saved-places/${placeId}`, {
      method: "DELETE",
      headers: { "x-csrf-token": readCookie("atct_csrf") ?? "" },
    });
    if (response.ok && state.status === "ready") {
      setState({
        status: "ready",
        items: state.items.filter((item) => item.placeId !== placeId),
      });
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
      {state.items.map((item) => (
        <li key={item.placeId}>
          <ContentCard>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Session-owned saved Place
            </p>
            <h2 className="mt-2 break-all font-bold">{item.placeId}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Catalog details are resolved through the public API when eligible.
            </p>
            <Button
              className="mt-4"
              onClick={() => remove(item.placeId)}
              variant="secondary"
            >
              Remove
            </Button>
          </ContentCard>
        </li>
      ))}
    </ul>
  );
}
