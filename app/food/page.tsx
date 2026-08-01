import { CatalogPreview } from "@/components/traveler/catalog-preview";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function FoodPage() {
  return (
    <TravelerShell>
      <h1 className="text-3xl font-bold">Food</h1>
      <CatalogPreview
        endpoint="/api/v1/foods?limit=20"
        heading="Thai food specialties"
        href="/food"
      />
      <CatalogPreview
        endpoint="/api/v1/restaurants?limit=20"
        heading="Restaurants"
        href="/food"
      />
    </TravelerShell>
  );
}
