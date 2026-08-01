import { demoItems, demoProvince } from "@/application/traveler/synthetic-content";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  Badge,
  ContentCard,
  HeroShell,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HelpPage() {
  const emergency = demoItems.find((item) => item.category === "emergency")!;
  return (
    <TravelerShell>
      <SyntheticNotice>
        <strong>DEMO EMERGENCY DIRECTORY — DO NOT USE FOR REAL ASSISTANCE</strong>
      </SyntheticNotice>
      <HeroShell
        compact
        eyebrow="Safety-first assistance"
        title="Help & emergency"
        description="This application is not an emergency dispatch service. Call actions appear only for fresh, verified records."
      >
        <Badge tone="danger">Never sponsored</Badge>
        <Badge tone="warning">Demo actions suppressed</Badge>
      </HeroShell>
      <ContentCard className="border-red-200 bg-red-50">
        <h2 className="text-xl font-bold text-red-950">
          Need real emergency help now?
        </h2>
        <p className="mt-2 text-sm text-red-900">
          Use official local emergency channels available to you. This development build
          contains no verified real-world contacts.
        </p>
      </ContentCard>
      <section>
        <h2 className="text-2xl font-bold">Assistance categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["Hospitals", "Police", "Fire & rescue", "Tourist assistance"].map(
            (label) => (
              <div
                className="rounded-2xl border border-red-100 bg-white p-4 text-sm font-bold text-red-900"
                key={label}
              >
                {label}
                <span className="mt-2 block text-xs font-normal text-slate-500">
                  No verified demo action
                </span>
              </div>
            ),
          )}
        </div>
      </section>
      <ContentCard className="border-red-200">
        <div className="flex gap-2">
          <Badge tone="danger">Expired demo</Badge>
          <Badge tone="warning">Actions suppressed</Badge>
        </div>
        <h2 className="mt-3 text-xl font-bold">{emergency.name}</h2>
        <p className="mt-2 text-sm text-slate-600">{emergency.summary}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-bold">Phone handoff</dt>
            <dd>Disabled pending verification</dd>
          </div>
          <div>
            <dt className="font-bold">Map handoff</dt>
            <dd>Disabled pending verification</dd>
          </div>
        </dl>
      </ContentCard>
      <StatusState
        state="empty"
        title="No verified emergency records are available"
        description="AI and synthetic fixtures never fill missing phone, address or coordinate fields."
      />
      <p className="text-xs text-slate-500">
        Synthetic province context: {demoProvince.name}. Emergency responses are
        excluded from service-worker caching.
      </p>
    </TravelerShell>
  );
}
