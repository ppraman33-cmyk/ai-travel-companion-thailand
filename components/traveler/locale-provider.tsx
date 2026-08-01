"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

import {
  normalizeTravelerLocale,
  travelerStrings,
  type TravelerLocale,
  type TravelerStrings,
} from "@/application/i18n/traveler-locale";

interface LocaleContextValue {
  readonly locale: TravelerLocale;
  readonly setLocale: Dispatch<SetStateAction<TravelerLocale>>;
  readonly strings: TravelerStrings;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en" as TravelerLocale,
  setLocale: () => undefined,
  strings: travelerStrings.en,
});

export function TravelerLocaleProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocale] = useState<TravelerLocale>(() =>
    typeof window === "undefined"
      ? "en"
      : normalizeTravelerLocale(
          window.localStorage.getItem("atct-locale") ?? navigator.language,
        ),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("atct-locale", locale);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, strings: travelerStrings[locale] }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useTravelerLocale = () => useContext(LocaleContext);

export function LanguageSwitch() {
  const { locale, setLocale, strings } = useTravelerLocale();
  return (
    <div
      className="inline-flex rounded-full border border-emerald-200 bg-white p-1"
      aria-label={strings.language}
    >
      {(["en", "th"] as const).map((option) => (
        <button
          aria-pressed={locale === option}
          className={`min-h-9 min-w-10 rounded-full px-3 text-xs font-bold ${locale === option ? "bg-emerald-800 text-white" : "text-slate-600"}`}
          key={option}
          onClick={() => setLocale(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
