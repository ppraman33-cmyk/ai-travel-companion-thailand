import { DiscoveryDirectory } from "@/components/traveler/discovery-directory";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function ProvincesPage() {
  return (
    <TravelerShell>
      <DiscoveryDirectory kind="provinces" />
    </TravelerShell>
  );
}
