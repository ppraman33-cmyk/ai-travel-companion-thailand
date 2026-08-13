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
      <section aria-labelledby="suggestion-title">
        <h2 className="text-2xl font-black" id="suggestion-title">
          Suggested deterministic actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Find synthetic attractions",
            "Open my Trips",
            "Review travel preferences",
          ].map((label) => (
            <span
              className="inline-flex min-h-11 items-center rounded-full border border-emerald-200 bg-white px-4 text-sm font-bold"
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      </section>
      <ContentCard>
        <label className="font-bold" htmlFor="assistant-input">
          Ask the assistant
        </label>
        <div className="mt-3 flex gap-2">
          <input
            aria-describedby="assistant-availability"
            className="min-h-12 min-w-0 flex-1 rounded-xl border px-4"
            disabled
            id="assistant-input"
            placeholder="Live AI is not available"
          />
          <button
            className="rounded-xl bg-slate-200 px-4 font-bold text-slate-500"
            disabled
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600" id="assistant-availability">
          No provider is active. No prompt or location leaves this application.
        </p>
      </ContentCard>
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
