import { TripsClient } from "@/components/traveler/trips-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";
export default async function TripDetailPresentation({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Owned Trip presentation"
        title="Trip itinerary"
        description={`Trip selection ${id.slice(0, 8)}… is resolved by the existing secure session workflow below.`}
      />
      <TripsClient />
    </TravelerShell>
  );
}
