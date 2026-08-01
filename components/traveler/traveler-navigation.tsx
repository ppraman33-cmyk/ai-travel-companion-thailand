"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/icon";

import { useTravelerLocale } from "./locale-provider";

const isCurrent = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function TravelerNavigation({ mobile = false }: { readonly mobile?: boolean }) {
  const pathname = usePathname();
  const { strings } = useTravelerLocale();
  const primary: { label: string; href: string; icon: IconName }[] = [
    { label: strings.home, href: "/", icon: "home" },
    { label: strings.explore, href: "/explore", icon: "search" },
    { label: strings.trips, href: "/trips", icon: "trip" },
    { label: strings.saved, href: "/saved", icon: "heart" },
    { label: strings.profile, href: "/profile", icon: "user" },
  ];
  const desktop = [
    ...primary,
    { label: strings.assistant, href: "/assistant", icon: "spark" as IconName },
    { label: strings.help, href: "/help", icon: "help" as IconName },
  ];
  const items = mobile ? primary : desktop;
  return (
    <nav aria-label={mobile ? strings.mobileNavigation : strings.primaryNavigation}>
      <ul className={mobile ? "grid grid-cols-5" : "grid gap-1"}>
        {items.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                aria-current={current ? "page" : undefined}
                className={
                  mobile
                    ? `flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.7rem] font-semibold ${
                        current ? "text-emerald-700" : "text-slate-500"
                      }`
                    : `flex min-h-11 items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        current
                          ? "bg-emerald-100 text-emerald-800"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                      }`
                }
                href={item.href}
              >
                <Icon className={mobile ? "size-5" : "size-5"} name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
