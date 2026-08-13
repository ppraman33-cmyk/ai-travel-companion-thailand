import { PreferencePage } from "@/components/traveler/preference-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function SettingsPage() {
  return (
    <TravelerShell>
      <PreferencePage kind="settings" />
    </TravelerShell>
  );
}
