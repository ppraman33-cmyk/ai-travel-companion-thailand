import { ProfileClient } from "@/components/traveler/profile-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";
import Link from "next/link";

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
      <nav aria-label="Profile tools" className="grid gap-3 sm:grid-cols-3">
        <Link className="reference-card min-h-14 p-4 font-bold" href="/settings">
          Settings
        </Link>
        <Link className="reference-card min-h-14 p-4 font-bold" href="/notifications">
          Notifications
        </Link>
        <Link className="reference-card min-h-14 p-4 font-bold" href="/privacy">
          Privacy
        </Link>
      </nav>
    </TravelerShell>
  );
}
