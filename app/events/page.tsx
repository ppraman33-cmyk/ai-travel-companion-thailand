import { CatalogPreview } from "@/components/traveler/catalog-preview";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function EventsPage() {
  return (
    <TravelerShell>
      <h1 className="text-3xl font-bold">Events and festivals</h1>
      <CatalogPreview
        endpoint="/api/v1/events?limit=20"
        heading="Verified events"
        href="/events"
      />
    </TravelerShell>
  );
}
