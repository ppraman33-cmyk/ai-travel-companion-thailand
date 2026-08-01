import { notFound } from "next/navigation";

import { demoProvince } from "@/application/traveler/synthetic-content";
import { ProvinceExperience } from "@/components/traveler/province-experience";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default async function CanonicalProvincePage({
  params,
}: {
  readonly params: Promise<{ region: string; province: string }>;
}) {
  const { region, province } = await params;
  if (region !== demoProvince.region || province !== demoProvince.slug) notFound();
  return (
    <TravelerShell>
      <ProvinceExperience />
    </TravelerShell>
  );
}
