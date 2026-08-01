import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  Badge,
  ContentCard,
  HeroShell,
  LinkButton,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";
import { Icon } from "@/components/ui/icon";

export default function AssistantPage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Provider-neutral safety state"
        title="AI assistant is not active"
        description="No prompt, location or trip data will be sent to an AI provider until approval, budget and grounding checks are complete."
      >
        <Badge tone="warning">Disabled-safe</Badge>
      </HeroShell>
      <div className="grid gap-4 md:grid-cols-3">
        <ContentCard>
          <Icon className="size-7 text-emerald-700" name="search" />
          <h2 className="mt-3 font-bold">Explore manually</h2>
          <p className="mt-2 text-sm text-slate-600">
            Deterministic catalog browsing stays available.
          </p>
        </ContentCard>
        <ContentCard>
          <Icon className="size-7 text-emerald-700" name="trip" />
          <h2 className="mt-3 font-bold">Plan manually</h2>
          <p className="mt-2 text-sm text-slate-600">Trip tools do not depend on AI.</p>
        </ContentCard>
        <ContentCard>
          <Icon className="size-7 text-red-700" name="help" />
          <h2 className="mt-3 font-bold">Emergency stays separate</h2>
          <p className="mt-2 text-sm text-slate-600">
            AI never invents emergency facts or contacts.
          </p>
        </ContentCard>
      </div>
      <StatusState
        state="empty"
        title="No live AI request will be sent"
        description="An approved provider can be connected later through the existing provider-independent boundary."
      />
      <LinkButton className="justify-self-start" href="/explore">
        Continue with Explore
      </LinkButton>
    </TravelerShell>
  );
}
