import { TripsClient } from "@/components/traveler/trips-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";

export default function TripsPage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Synthetic visual · anonymous-session ownership"
        title="Plan your trip"
        description="Create trips, build day-by-day itineraries, and manage your stops."
      />
      <TripsClient />
    </TravelerShell>
  );
}
