import { TravelerShell } from "@/components/traveler/traveler-shell";
import { TripsClient } from "@/components/traveler/trips-client";

export default function TripsPage() {
  return (
    <TravelerShell>
      <h1 className="text-3xl font-bold">Trips</h1>
      <TripsClient />
    </TravelerShell>
  );
}
