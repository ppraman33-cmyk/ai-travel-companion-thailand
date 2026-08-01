import Link from "next/link";
import type { ReactNode } from "react";

import { ServiceWorkerRegistration } from "./service-worker-registration";
import { TravelerNavigation } from "./traveler-navigation";

export function TravelerShell({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegistration />
      {process.env.NEXT_PUBLIC_APP_ENV !== "production" ? (
        <div className="bg-sky-950 px-4 py-2 text-center text-sm font-semibold text-white">
          Development environment — test data may be present
        </div>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="flex items-center gap-2 font-bold text-emerald-900" href="/">
            <span
              className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white"
              aria-hidden="true"
            >
              T
            </span>
            <span>Thailand Companion</span>
          </Link>
          <div className="hidden md:block">
            <TravelerNavigation />
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 pb-28">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-white md:hidden">
        <TravelerNavigation mobile />
      </div>
    </>
  );
}
