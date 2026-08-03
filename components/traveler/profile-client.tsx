"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  preferenceOptions,
  summarizePreferences,
  type TravelerPreferences,
} from "@/application/traveler/preferences";
import {
  Button,
  ContentCard,
  Field,
  Select,
  StatusState,
  Toast,
} from "@/components/ui/design-system";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

type PrefState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly prefs: TravelerPreferences }
  | { readonly status: "unavailable" };

export function ProfileClient() {
  const [state, setState] = useState<PrefState>({ status: "loading" });
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string>();

  const loadPrefs = useCallback(async () => {
    const response = await fetch("/api/v1/preferences", { credentials: "same-origin" });
    if (response.ok) {
      const body = (await response.json()) as { data: TravelerPreferences };
      setState({ status: "ready", prefs: body.data });
    } else {
      setState({ status: "unavailable" });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/preferences", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body: { data: TravelerPreferences }) => {
        if (!cancelled) setState({ status: "ready", prefs: body.data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unavailable" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function savePrefs(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const prefs: TravelerPreferences = {
      transportation: String(form.get("transportation") || ""),
      travelStyle: String(form.get("travelStyle") || ""),
      companions: String(form.get("companions") || ""),
      activityLevel: String(form.get("activityLevel") || ""),
      budget: String(form.get("budget") || ""),
      language: document.documentElement.lang,
    };
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const session = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (session.ok) csrf = readCookie("atct_csrf");
    }
    const response = await fetch("/api/v1/preferences", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify(prefs),
    });
    if (response.ok) {
      setToast("Preferences saved.");
      setEditing(false);
      await loadPrefs();
    } else {
      setToast("Preferences could not be saved.");
    }
  }

  async function resetPrefs() {
    let csrf = readCookie("atct_csrf");
    if (!csrf) {
      const session = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: document.documentElement.lang }),
      });
      if (session.ok) csrf = readCookie("atct_csrf");
    }
    const response = await fetch("/api/v1/preferences", {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
      body: JSON.stringify({}),
    });
    if (response.ok) {
      setToast("Preferences reset.");
      setEditing(false);
      await loadPrefs();
    } else {
      setToast("Preferences could not be reset.");
    }
  }

  if (state.status === "loading")
    return (
      <StatusState
        state="loading"
        title="Loading your profile"
        description="Checking anonymous-session preferences…"
      />
    );
  if (state.status === "unavailable")
    return (
      <StatusState
        state="error"
        title="Profile unavailable"
        description="Preferences can be set once session persistence is active."
      />
    );

  const summary = summarizePreferences(state.prefs);

  return (
    <div className="grid gap-5">
      <ContentCard>
        <h2 className="text-xl font-bold">Anonymous by default</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600">
          <li>Trips and saved places are tied to your anonymous session only.</li>
          <li>No location history is stored. No account is required.</li>
          <li>If you clear your browser data, your session and trips are unrecoverable.</li>
        </ul>
      </ContentCard>

      <ContentCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">Travel preferences</h2>
            <p className="mt-1 text-sm text-slate-500">
              Used to personalize your saved places, trips, and explore recommendations.
            </p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)} variant="secondary">
              Edit preferences
            </Button>
          ) : null}
        </div>

        {editing ? (
          <form className="mt-4 grid gap-4" onSubmit={savePrefs}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Transportation">
                <Select defaultValue={state.prefs.transportation ?? ""} name="transportation">
                  <option value="">Prefer not to say</option>
                  {preferenceOptions.transportation.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Travel style">
                <Select defaultValue={state.prefs.travelStyle ?? ""} name="travelStyle">
                  <option value="">Prefer not to say</option>
                  {preferenceOptions.travelStyle.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Companions">
                <Select defaultValue={state.prefs.companions ?? ""} name="companions">
                  <option value="">Prefer not to say</option>
                  {preferenceOptions.companions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Activity level">
                <Select defaultValue={state.prefs.activityLevel ?? ""} name="activityLevel">
                  <option value="">Prefer not to say</option>
                  {preferenceOptions.activityLevel.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Budget">
                <Select defaultValue={state.prefs.budget ?? ""} name="budget">
                  <option value="">Prefer not to say</option>
                  {preferenceOptions.budget.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <Button
                onClick={resetPrefs}
                type="button"
                variant="danger"
              >
                Reset all
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditing(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit">Save preferences</Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            {summary.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No preferences set. Edit to personalize your experience.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {summary.map((label, i) => (
                  <span
                    className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900"
                    key={i}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </ContentCard>

      <ContentCard>
        <h2 className="text-xl font-bold">Data controls</h2>
        <p className="mt-2 text-sm text-slate-600">
          Session revocation is a future, persistence-gated feature.
        </p>
        <Button className="mt-4" disabled variant="secondary">
          Revoke session
        </Button>
      </ContentCard>

      {toast ? <Toast>{toast}</Toast> : null}
    </div>
  );
}
