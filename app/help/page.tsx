import { CatalogPreview } from "@/components/traveler/catalog-preview";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default function HelpPage() {
  return (
    <TravelerShell>
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <h1 className="text-3xl font-bold">Emergency and traveler help</h1>
        <p className="mt-3">
          Availability can change. Only current verified records are shown; if none are
          available, this app will not invent contact details.
        </p>
      </section>
      <CatalogPreview
        endpoint="/api/v1/emergency-services?limit=20"
        heading="Verified assistance"
        href="/help"
      />
    </TravelerShell>
  );
}
