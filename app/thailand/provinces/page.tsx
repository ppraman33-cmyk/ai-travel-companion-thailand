import { DiscoveryDirectory } from "@/components/traveler/discovery-directory";
import { ThailandMapSection } from "@/components/traveler/thailand-map-section";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function ProvincesPage() {
  return (
    <TravelerShell>
      <DiscoveryDirectory kind="provinces" />
      <ThailandMapSection />
    </TravelerShell>
  );
}
