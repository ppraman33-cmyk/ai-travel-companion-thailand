import { PreferencePage } from "@/components/traveler/preference-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default function NotificationsPage() {
  return (
    <TravelerShell>
      <PreferencePage kind="notifications" />
    </TravelerShell>
  );
}
