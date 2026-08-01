import {
  categoryLabels,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import {
  Badge,
  ContentCard,
  HeroShell,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";

import { TravelerActions } from "./traveler-actions";

const sections: Record<DemoCategory, readonly [string, string][]> = {
  attractions: [
    ["Overview", "Synthetic overview pending evidence review."],
    ["History", "No historical claim is published for this demo."],
    ["Hours and fees", "Unknown — verification required."],
    ["Dress and facilities", "Guidance and accessibility evidence pending."],
  ],
  restaurants: [
    ["Menu highlights", "Synthetic menu examples are intentionally omitted."],
    ["Why visit", "A component slot for a verified unique selling point."],
    ["Price and hours", "Unknown — evidence pending."],
    ["Suitability", "Dietary and accessibility claims require a source."],
  ],
  foods: [
    ["Description", "A synthetic specialty concept, not a real product claim."],
    ["Local significance", "Cultural interpretation requires community review."],
    ["Production area", "Community producer and authentic area evidence pending."],
    ["Where to find it", "Related verified places will appear here."],
  ],
  events: [
    ["Occurrence", "The next annual date has not been verified."],
    ["Location", "Venue evidence pending."],
    ["Cultural guidance", "Local reviewer guidance will appear here."],
    ["Annual update", "Expired occurrences cannot be reused as current."],
  ],
  emergency: [
    ["Verification status", "Expired demo record — critical fields suppressed."],
    ["Freshness", "No current verification record is attached."],
    ["Call handoff", "Disabled. A confirmation is required for verified numbers."],
    ["Map handoff", "Disabled until coordinates and address are current."],
  ],
};

export function DetailExperience({
  item,
}: {
  readonly item: {
    readonly id: string;
    readonly name: string;
    readonly thaiName: string;
    readonly summary: string;
    readonly meta: string;
    readonly category: DemoCategory;
  };
}) {
  const emergency = item.category === "emergency";
  return (
    <>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow={`${categoryLabels[item.category]} · synthetic detail`}
        title={item.name}
        description={item.summary}
      >
        <Badge tone={emergency ? "danger" : "info"}>Synthetic demo</Badge>
        <span lang="th">{item.thaiName}</span>
      </HeroShell>
      {emergency ? (
        <div
          className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"
          role="alert"
        >
          <p className="font-bold">Not a real emergency service</p>
          <p className="mt-1 text-sm">
            Pending or expired critical information is suppressed and is never cached
            for offline use.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {sections[item.category].map(([title, description]) => (
          <ContentCard key={title}>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </ContentCard>
        ))}
      </div>
      <ContentCard>
        <div className="flex flex-wrap gap-2">
          <Badge tone="warning">Evidence pending</Badge>
          <Badge tone="neutral">No authorized documentary image</Badge>
        </div>
        <h2 className="mt-4 text-xl font-bold">Trust and provenance</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-bold">Publication state</dt>
            <dd>Development-only synthetic</dd>
          </div>
          <div>
            <dt className="font-bold">Source</dt>
            <dd>Synthetic M2 fixture</dd>
          </div>
          <div>
            <dt className="font-bold">Last verified</dt>
            <dd>Not applicable</dd>
          </div>
          <div>
            <dt className="font-bold">Media rights</dt>
            <dd>No real media attached</dd>
          </div>
        </dl>
      </ContentCard>
      <div className="flex flex-wrap gap-3">
        <TravelerActions emergency={emergency} placeId={item.id} />
      </div>
      <StatusState
        description="No unverified fallback facts will be generated."
        state="empty"
        title="Additional verified details are not available"
      />
    </>
  );
}
