import Link from "next/link";

import type { DemoCategory } from "@/application/traveler/synthetic-content";
import { Badge, ContentCard } from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

const icons = {
  attractions: "place",
  restaurants: "food",
  foods: "food",
  events: "event",
  emergency: "help",
} as const;

export function DemoCard({
  item,
  href,
}: {
  readonly item: {
    readonly name: string;
    readonly thaiName: string;
    readonly summary: string;
    readonly meta: string;
    readonly category: DemoCategory;
  };
  readonly href: string;
}) {
  const emergency = item.category === "emergency";
  return (
    <ContentCard
      className={`group relative flex h-full flex-col overflow-hidden p-0 ${emergency ? "border-red-200" : ""}`}
    >
      <div
        className={`grid aspect-[16/9] place-items-center ${emergency ? "bg-red-50 text-red-700" : "bg-gradient-to-br from-emerald-100 via-teal-50 to-amber-50 text-emerald-800"}`}
      >
        <Icon className="size-10" name={icons[item.category]} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone={emergency ? "danger" : "info"}>Synthetic demo</Badge>
          <Badge tone="warning">Evidence pending</Badge>
        </div>
        <h3 className="mt-3 text-lg font-bold">
          <Link className="after:absolute after:inset-0" href={href}>
            {item.name}
          </Link>
        </h3>
        <p className="text-sm text-slate-500" lang="th">
          {item.thaiName}
        </p>
        <p className="mt-3 flex-1 text-sm text-slate-600">{item.summary}</p>
        <p
          className={`mt-4 text-xs font-bold ${emergency ? "text-red-700" : "text-emerald-700"}`}
        >
          {item.meta}
        </p>
      </div>
    </ContentCard>
  );
}
