"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Explore", href: "/explore", icon: "◇" },
  { label: "Trips", href: "/trips", icon: "▱" },
  { label: "AI", href: "/assistant", icon: "✦" },
  { label: "Profile", href: "/profile", icon: "○" },
] as const;

const isCurrent = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function TravelerNavigation({ mobile = false }: { readonly mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label={mobile ? "Mobile navigation" : "Primary navigation"}>
      <ul className={mobile ? "grid grid-cols-5" : "flex items-center gap-1"}>
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
                    : `block rounded-full px-4 py-2 text-sm font-semibold transition ${
                        current
                          ? "bg-emerald-100 text-emerald-800"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                      }`
                }
                href={item.href}
              >
                {mobile ? (
                  <span aria-hidden="true" className="text-xl leading-none">
                    {item.icon}
                  </span>
                ) : null}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
