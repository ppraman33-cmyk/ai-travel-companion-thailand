import { TripsClient } from "@/components/traveler/trips-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";

export default function TripsPage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        coverImage="https://images.pexels.com/photos/8821868/pexels-photo-8821868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        eyebrow="Anonymous-session ownership"
        title="Plan your trip"
        description="Create trips, build day-by-day itineraries, and manage your stops."
      />
      <TripsClient />
    </TravelerShell>
  );
}
