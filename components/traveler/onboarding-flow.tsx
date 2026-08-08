"use client";

import { useState, type FormEvent } from "react";

import {
  Button,
  ContentCard,
  Field,
  Select,
  SyntheticNotice,
} from "@/components/ui/design-system";
import {
  preferenceOptions,
  type TravelerPreferences,
} from "@/application/traveler/preferences";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

const STEPS = [
  {
    key: "transportation",
    label: "Preferred transportation",
    options: preferenceOptions.transportation,
  },
  { key: "travelStyle", label: "Travel style", options: preferenceOptions.travelStyle },
  {
    key: "companions",
    label: "Travel companions",
    options: preferenceOptions.companions,
  },
  {
    key: "activityLevel",
    label: "Activity level",
    options: preferenceOptions.activityLevel,
  },
  { key: "budget", label: "Budget preference", options: preferenceOptions.budget },
] as const;

export function OnboardingFlow({ onComplete }: { readonly onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function savePreferences(finalPrefs: Record<string, string>) {
    setSaving(true);
    setSaveError(null);
    try {
      let csrf = readCookie("atct_csrf");
      if (!csrf) {
        const session = await fetch("/api/v1/sessions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale: document.documentElement.lang }),
        });
        if (!session.ok) throw new Error("session");
        csrf = readCookie("atct_csrf");
      }
      const response = await fetch("/api/v1/preferences", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify(finalPrefs),
      });
      if (!response.ok) throw new Error("preferences");
      onComplete();
      return true;
    } catch {
      setSaveError("Your preferences could not be saved. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const key = STEPS[step].key;
    const value = formData.get(key);
    const updated = value ? { ...prefs, [key]: String(value) } : { ...prefs };
    setPrefs(updated);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await savePreferences({ ...updated, language: document.documentElement.lang });
    }
  }

  async function skip() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await savePreferences({ ...prefs, language: document.documentElement.lang });
    }
  }

  function skipAll() {
    // Explicit privacy-preserving skip: complete locally without creating a
    // server session or claiming that preferences were persisted.
    onComplete();
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <ContentCard>
      <SyntheticNotice />
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
            Step {step + 1} of {STEPS.length}
          </p>
          <button
            className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            disabled={saving}
            onClick={skipAll}
            type="button"
          >
            Skip all
          </button>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-emerald-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={next}>
        {saveError ? (
          <p
            className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800"
            role="alert"
          >
            {saveError}
          </p>
        ) : null}
        <Field label={current.label}>
          <Select defaultValue={prefs[current.key] ?? ""} name={current.key}>
            <option value="">Prefer not to say</option>
            {current.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center justify-between gap-3">
          <Button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            type="button"
            variant="ghost"
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              disabled={saving}
              onClick={() => void skip()}
              type="button"
              variant="secondary"
            >
              Skip
            </Button>
            <Button disabled={saving} type="submit">
              {isLast ? (saving ? "Saving…" : "Finish") : "Next"}
            </Button>
          </div>
        </div>
      </form>
    </ContentCard>
  );
}

export type { TravelerPreferences };
