"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";

import {
  LanguageSwitch,
  TravelerLocaleProvider,
  useTravelerLocale,
} from "./locale-provider";
import { ServiceWorkerRegistration } from "./service-worker-registration";
import { TravelerNavigation } from "./traveler-navigation";

export function TravelerShell({ children }: { readonly children: ReactNode }) {
  return (
    <TravelerLocaleProvider>
      <TravelerFrame>{children}</TravelerFrame>
    </TravelerLocaleProvider>
  );
}

function TravelerFrame({ children }: { readonly children: ReactNode }) {
  const { strings } = useTravelerLocale();
  return (
    <>
      <ServiceWorkerRegistration />
      <a
        className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        href="#main-content"
      >
        {strings.skipToContent}
      </a>
      <div
        className="bg-sky-950 px-4 py-2 text-center text-xs font-bold text-white"
        data-testid="synthetic-banner"
      >
        {strings.syntheticBanner}
      </div>
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            className="flex min-h-11 items-center gap-2 font-bold text-emerald-950"
            href="/"
          >
            <span
              className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-sm text-white"
              aria-hidden="true"
            >
              ATC
            </span>
            <span className="leading-tight">
              {strings.appName}
              <small className="block text-[0.65rem] font-medium text-slate-500">
                AI Travel Companion Thailand
              </small>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <Link
              className="hidden min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-800 sm:flex"
              href="/help"
            >
              <Icon name="help" />
              {strings.help}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="sticky top-[4.3rem] hidden h-[calc(100vh-4.3rem)] border-r border-[var(--color-border)] bg-white p-5 lg:block">
          <TravelerNavigation />
        </aside>
        <main
          className="grid min-w-0 gap-8 px-4 py-6 pb-28 [&>*]:min-w-0 sm:px-6 lg:px-8 lg:pb-10"
          id="main-content"
        >
          {children}
        </main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-white/95 backdrop-blur lg:hidden">
        <TravelerNavigation mobile />
      </div>
    </>
  );
}
