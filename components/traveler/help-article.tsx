import Link from "next/link";
import {
  ContentCard,
  PageHeader,
  SyntheticNotice,
} from "@/components/ui/design-system";
export function HelpArticle({ slug }: { readonly slug: string }) {
  return (
    <div className="reference-page">
      <SyntheticNotice />
      <PageHeader
        eyebrow="Help article"
        title="Using safe traveler features"
        description="Guidance reflects only functionality available in this build."
      />
      <ContentCard>
        <p className="text-sm font-bold text-emerald-700">Article: {slug}</p>
        <ol className="mt-5 grid gap-4">
          <li>
            <strong>1. Explore synthetic previews.</strong>
            <p className="text-slate-600">
              Demo labels distinguish previews from publication-eligible records.
            </p>
          </li>
          <li>
            <strong>2. Save or add to an owned Trip.</strong>
            <p className="text-slate-600">
              Secure anonymous-session ownership is verified by the server.
            </p>
          </li>
          <li>
            <strong>3. Confirm external maps.</strong>
            <p className="text-slate-600">
              Only trusted Google Maps or Apple Maps handoff is supported.
            </p>
          </li>
        </ol>
      </ContentCard>
      <Link
        className="inline-flex min-h-11 items-center justify-self-start rounded-xl border px-4 font-bold"
        href="/help"
      >
        Back to Help
      </Link>
    </div>
  );
}
