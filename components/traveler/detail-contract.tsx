import type { ReactNode } from "react";

import { Badge, ContentCard } from "@/components/ui/design-system";

export type TravelerDetailKind =
  "attraction" | "restaurant" | "food" | "event" | "emergency";

export interface TravelerDetailContract {
  readonly kind: TravelerDetailKind;
  readonly title: string;
  readonly summary: string;
  readonly provenanceLabel: string;
  readonly lastVerifiedLabel?: string;
  readonly actions?: ReactNode;
}

export function TravelerDetail({
  detail,
}: {
  readonly detail: TravelerDetailContract;
}) {
  const emergency = detail.kind === "emergency";
  return (
    <ContentCard className={emergency ? "border-red-300" : undefined}>
      <Badge tone={emergency ? "danger" : "success"}>{detail.kind}</Badge>
      <h1 className="mt-3 text-3xl font-bold">{detail.title}</h1>
      <p className="mt-3 text-slate-700">{detail.summary}</p>
      <dl className="mt-6 grid gap-2 border-t pt-4 text-sm">
        <div>
          <dt className="font-semibold">Source</dt>
          <dd>{detail.provenanceLabel}</dd>
        </div>
        {detail.lastVerifiedLabel ? (
          <div>
            <dt className="font-semibold">Last verified</dt>
            <dd>{detail.lastVerifiedLabel}</dd>
          </div>
        ) : null}
      </dl>
      {detail.actions ? (
        <div className="mt-6 flex flex-wrap gap-3">{detail.actions}</div>
      ) : null}
    </ContentCard>
  );
}
