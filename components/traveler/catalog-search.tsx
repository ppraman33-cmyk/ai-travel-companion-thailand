"use client";

import { useState, type FormEvent } from "react";

interface SearchResult {
  readonly id: string;
  readonly kind: string;
  readonly name: string;
  readonly canonicalThaiName?: string;
  readonly category?: string;
}

export function CatalogSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setStatus("loading");
    try {
      const response = await fetch(
        `/api/v1/search?q=${encodeURIComponent(query.trim())}&limit=30`,
      );
      if (!response.ok) throw new Error("search unavailable");
      const body = (await response.json()) as {
        data: { items: readonly SearchResult[] };
      };
      setResults(body.data.items);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[var(--shadow-card)]"
      aria-labelledby="search-title"
    >
      <h2 id="search-title" className="text-xl font-bold">
        Search verified Thailand content
      </h2>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <label className="sr-only" htmlFor="catalog-search">
          Province, place, food, or festival
        </label>
        <input
          className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-base"
          id="catalog-search"
          minLength={2}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Province, attraction, restaurant, specialty…"
          type="search"
          value={query}
        />
        <button
          className="min-h-12 rounded-2xl bg-emerald-700 px-6 font-semibold text-white hover:bg-emerald-800"
          type="submit"
        >
          Search
        </button>
      </form>
      <div aria-live="polite" className="mt-4">
        {status === "loading" ? <p>Searching eligible records…</p> : null}
        {status === "error" ? (
          <p className="rounded-xl bg-amber-50 p-4 text-amber-900">
            Search is temporarily unavailable.
          </p>
        ) : null}
        {status === "ready" && results.length === 0 ? (
          <p>No verified matches are currently published.</p>
        ) : null}
        {status === "ready" && results.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {results.map((result) => (
              <li
                className="rounded-2xl bg-slate-50 p-4"
                key={`${result.kind}-${result.id}`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {result.category ?? result.kind}
                </p>
                <p className="mt-1 font-semibold">{result.name}</p>
                {result.canonicalThaiName ? (
                  <p className="text-sm text-slate-500" lang="th">
                    {result.canonicalThaiName}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
