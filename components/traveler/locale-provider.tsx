"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
  normalizeTravelerLocale,
  travelerStrings,
  type TravelerLocale,
  type TravelerStrings,
} from "@/application/i18n/traveler-locale";

interface LocaleContextValue {
  readonly locale: TravelerLocale;
  readonly setLocale: (locale: TravelerLocale) => void;
  readonly strings: TravelerStrings;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en" as TravelerLocale,
  setLocale: () => undefined,
  strings: travelerStrings.en,
});

const localeChangeEvent = "atct-locale-change";
const subscribeLocale = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(localeChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(localeChangeEvent, callback);
  };
};
const clientLocaleSnapshot = () =>
  normalizeTravelerLocale(
    window.localStorage.getItem("atct-locale") ?? navigator.language,
  );
const serverLocaleSnapshot = (): TravelerLocale => "en";
const updateLocale = (nextLocale: TravelerLocale) => {
  window.localStorage.setItem("atct-locale", nextLocale);
  window.dispatchEvent(new Event(localeChangeEvent));
};

export function TravelerLocaleProvider({ children }: { readonly children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    clientLocaleSnapshot,
    serverLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale: updateLocale, strings: travelerStrings[locale] }),
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
          className={`min-h-11 min-w-11 rounded-full px-3 text-xs font-bold ${locale === option ? "bg-emerald-800 text-white" : "text-slate-600"}`}
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
