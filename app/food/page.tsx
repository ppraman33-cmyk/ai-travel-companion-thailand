import { SyntheticCatalogPage } from "@/components/traveler/synthetic-catalog-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function FoodPage() {
  return (
    <TravelerShell>
      <SyntheticCatalogPage
        categories={["restaurants", "foods"]}
        title="Food and restaurants"
        description="Explore synthetic dining and local-specialty presentation without real hours, prices or claims."
      />
    </TravelerShell>
  );
}
