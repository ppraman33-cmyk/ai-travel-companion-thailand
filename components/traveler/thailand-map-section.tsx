import { loadThailandProvinceMap } from "@/application/geography/thailand-province-map";
import { ThailandProvinceMap } from "@/components/traveler/thailand-province-map";

export function ThailandMapSection({ region = "all" }: { readonly region?: string }) {
  return (
    <ThailandProvinceMap initialRegion={region} provinces={loadThailandProvinceMap()} />
  );
}
