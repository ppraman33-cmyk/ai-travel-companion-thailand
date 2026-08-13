import Link from "next/link";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  ContentCard,
  PageHeader,
  SyntheticNotice,
} from "@/components/ui/design-system";
export default function AboutPage() {
  return (
    <TravelerShell>
      <div className="reference-page">
        <SyntheticNotice />
        <PageHeader
          eyebrow="About"
          title="AI Travel Companion Thailand"
          description="A safety-first companion for foreign tourists, shaped for nationwide verified coverage."
        />
        <ContentCard>
          <h2 className="text-xl font-black">MVP commitments</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            <li>Free traveler access</li>
            <li>External navigation handoff only</li>
            <li>No hotel booking, live AI or commercial ranking</li>
            <li>Real content requires provenance, rights and verification</li>
          </ul>
        </ContentCard>
        <Link
          className="inline-flex min-h-11 items-center justify-self-start rounded-xl border px-4 font-bold"
          href="/help"
        >
          Help and safety
        </Link>
      </div>
    </TravelerShell>
  );
}
