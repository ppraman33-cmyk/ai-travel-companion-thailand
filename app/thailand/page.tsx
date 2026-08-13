import { DiscoveryDirectory } from "@/components/traveler/discovery-directory";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function ThailandPage() {
  return (
    <TravelerShell>
      <DiscoveryDirectory kind="thailand" />
    </TravelerShell>
  );
}
