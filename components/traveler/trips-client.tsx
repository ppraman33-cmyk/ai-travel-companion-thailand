"use client";

import { useState, type FormEvent } from "react";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export function TripsClient() {
  const [message, setMessage] = useState("Create an anonymous session to save a trip.");

  const createTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const session = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: "en" }),
      });
      if (!session.ok) {
        setMessage(
          "Trip saving is unavailable until secure session persistence is configured.",
        );
        return;
      }
      csrf = readCookie("atct_csrf");
    }
    const response = await fetch("/api/v1/trips", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrf ?? "",
      },
      body: JSON.stringify({ title: form.get("title") }),
    });
    setMessage(response.ok ? "Trip created." : "Trip could not be created safely.");
    if (response.ok) event.currentTarget.reset();
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <h2 className="text-xl font-semibold">Create a trip</h2>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={createTrip}>
        <label className="flex-1">
          <span className="text-sm font-medium">Trip name</span>
          <input
            className="mt-1 min-h-11 w-full rounded-lg border border-[var(--color-border)] px-3"
            maxLength={120}
            name="title"
            required
          />
        </label>
        <button
          className="min-h-11 self-end rounded-lg bg-emerald-700 px-5 font-semibold text-white"
          type="submit"
        >
          Create trip
        </button>
      </form>
      <p
        className="mt-4 text-sm text-[var(--color-muted)]"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </section>
  );
}
