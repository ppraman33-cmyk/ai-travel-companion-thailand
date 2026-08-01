import { TravelerShell } from "@/components/traveler/traveler-shell";
import { TripsClient } from "@/components/traveler/trips-client";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";

export default function TripsPage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Anonymous-session ownership"
        title="Plan your trip"
        description="Create a private trip, organize days and keep manual control when AI is unavailable."
      />
      <TripsClient />
    </TravelerShell>
  );
}
