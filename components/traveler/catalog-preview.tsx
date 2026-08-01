"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CatalogItem {
  readonly id: string;
  readonly name: string;
  readonly canonicalThaiName?: string;
  readonly category?: string;
  readonly informationCheckedAt?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly slug?: string;
  readonly mapActions?: {
    readonly googleDirections: string;
    readonly appleDirections: string;
  };
}

type State =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly items: readonly CatalogItem[] }
  | { readonly status: "error" };

export function CatalogPreview({
  endpoint,
  heading,
  href,
  detailBaseHref,
}: {
  readonly endpoint: string;
  readonly heading: string;
  readonly href: string;
  readonly detailBaseHref?: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal, credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        const body = (await response.json()) as {
          data: { items: readonly CatalogItem[] };
        };
        setState({ status: "ready", items: body.data.items });
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({ status: "error" });
        }
      });
    return () => controller.abort();
  }, [endpoint]);

  return (
    <section aria-labelledby={`${heading.replaceAll(" ", "-")}-heading`}>
      <div className="flex items-end justify-between gap-4">
        <h2
          id={`${heading.replaceAll(" ", "-")}-heading`}
          className="text-2xl font-bold"
        >
          {heading}
        </h2>
        <Link className="font-semibold text-emerald-700" href={href}>
          View all
        </Link>
      </div>
      {state.status === "loading" ? (
        <p className="mt-4 text-[var(--color-muted)]" role="status">
          Loading verified information…
        </p>
      ) : state.status === "error" ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-4" role="status">
          Verified information is temporarily unavailable.
        </p>
      ) : state.items.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-4">
          No eligible information is available.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((item) => (
            <li
              className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-lg"
              key={item.id}
            >
              <div
                className="aspect-[16/9] bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-100"
                aria-hidden="true"
              />
              <div className="p-5">
                <h3 className="font-semibold text-slate-950">
                  {detailBaseHref ? (
                    <Link href={`${detailBaseHref}/${item.id}`}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </h3>
                {item.canonicalThaiName ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]" lang="th">
                    {item.canonicalThaiName}
                  </p>
                ) : null}
                {(item.summary ?? item.description) ? (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {item.summary ?? item.description}
                  </p>
                ) : null}
                {item.informationCheckedAt ? (
                  <p className="mt-4 text-xs font-medium text-emerald-700">
                    Checked{" "}
                    {new Date(item.informationCheckedAt).toLocaleDateString("en")}
                  </p>
                ) : null}
                {item.mapActions ? (
                  <div className="mt-4 flex gap-2">
                    <a
                      className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
                      href={item.mapActions.googleDirections}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Google Maps
                    </a>
                    <a
                      className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                      href={item.mapActions.appleDirections}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Apple Maps
                    </a>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
