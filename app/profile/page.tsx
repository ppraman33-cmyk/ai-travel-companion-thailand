import { ProfileClient } from "@/components/traveler/profile-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";

export default function ProfilePage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Anonymous session"
        title="Your travel profile"
        description="Manage your preferences and data controls."
      />
      <ProfileClient />
    </TravelerShell>
  );
}
