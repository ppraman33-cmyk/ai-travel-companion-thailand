import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  Badge,
  ContentCard,
  HeroShell,
  SyntheticNotice,
} from "@/components/ui/design-system";

export default function ProfilePage() {
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow="Privacy-first settings"
        title="Profile & language"
        description="The MVP uses an anonymous session—no account, email or cross-device identity is created."
      >
        <Badge tone="success">Free for travelers</Badge>
      </HeroShell>
      <div className="grid gap-4 md:grid-cols-2">
        <ContentCard>
          <h2 className="text-xl font-bold">Anonymous by default</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-600">
            <li>Trips and saves belong only to this session.</li>
            <li>No precise location history is stored.</li>
            <li>Device loss may make anonymous data unrecoverable.</li>
          </ul>
        </ContentCard>
        <ContentCard>
          <h2 className="text-xl font-bold">Thai / English readiness</h2>
          <p className="mt-3 text-sm text-slate-600">
            The header switch changes shared navigation and safety labels. Content
            translations remain evidence-gated and are not claimed as verified.
          </p>
          <p className="mt-4 font-semibold" lang="th">
            ป้ายความปลอดภัยมีข้อความสำรองภาษาไทยและอังกฤษ
          </p>
        </ContentCard>
      </div>
      <ContentCard>
        <h2 className="text-xl font-bold">Data controls foundation</h2>
        <p className="mt-2 text-sm text-slate-600">
          Session revocation will use the existing server API and requires confirmation
          when persistence is configured.
        </p>
        <button
          className="mt-5 min-h-11 rounded-xl border border-red-300 px-4 font-bold text-red-800"
          disabled
          type="button"
        >
          Revoke unavailable session
        </button>
      </ContentCard>
    </TravelerShell>
  );
}
