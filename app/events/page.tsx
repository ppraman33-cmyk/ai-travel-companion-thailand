import { SyntheticCatalogPage } from "@/components/traveler/synthetic-catalog-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function EventsPage() {
  return (
    <TravelerShell>
      <SyntheticCatalogPage
        categories={["events"]}
        title="Festivals and events"
        description="Discover clearly labelled fictional previews while every real occurrence remains evidence-gated."
      />
    </TravelerShell>
  );
}
