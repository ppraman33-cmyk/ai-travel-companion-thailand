import { PreferencePage } from "@/components/traveler/preference-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function PrivacyPage() {
  return (
    <TravelerShell>
      <PreferencePage kind="privacy" />
    </TravelerShell>
  );
}
