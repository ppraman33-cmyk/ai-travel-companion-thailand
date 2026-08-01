import { SavedClient } from "@/components/traveler/saved-client";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { HeroShell, SyntheticNotice } from "@/components/ui/design-system";

export default function SavedPage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Anonymous session"
        title="Saved places"
        description="Only records owned by this browser session can appear here."
      />
      <SavedClient />
    </TravelerShell>
  );
}
