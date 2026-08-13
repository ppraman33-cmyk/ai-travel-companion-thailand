import { DiscoveryDirectory } from "@/components/traveler/discovery-directory";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function RegionsPage() {
  return (
    <TravelerShell>
      <DiscoveryDirectory kind="regions" />
    </TravelerShell>
  );
}
