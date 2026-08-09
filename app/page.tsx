import { HomeExperience } from "@/components/traveler/home-experience";
import { OnboardingGate } from "@/components/traveler/onboarding-gate";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function HomePage() {
  return (
    <TravelerShell>
      <OnboardingGate>
        <HomeExperience />
      </OnboardingGate>
    </TravelerShell>
  );
}
