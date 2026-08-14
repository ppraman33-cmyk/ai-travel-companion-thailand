import { notFound } from "next/navigation";

import { findProvinceBySlug } from "@/application/geography/thailand-province-map";
import { demoProvince } from "@/application/traveler/synthetic-content";
import { ProvinceExperience } from "@/components/traveler/province-experience";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default async function CanonicalProvincePage({
  params,
}: {
  readonly params: Promise<{ region: string; province: string }>;
}) {
  const { region, province } = await params;
  if (region === demoProvince.region && province === demoProvince.slug) {
    return (
      <TravelerShell>
        <ProvinceExperience />
      </TravelerShell>
    );
  }
  const mappedProvince = findProvinceBySlug(region, province);
  if (!mappedProvince) notFound();
  return (
    <TravelerShell>
      <main className="reference-page">
        <p className="reference-eyebrow">
          Licensed geography · content evidence pending
        </p>
        <h1 className="text-4xl font-black sm:text-6xl">{mappedProvince.nameEn}</h1>
        <p className="text-xl" lang="th">
          {mappedProvince.nameTh}
        </p>
        <div className="reference-card p-6 sm:p-8" role="status">
          <h2 className="text-2xl font-black">Province overview unavailable</h2>
          <p className="mt-3 text-slate-600">
            This map selection identifies a verified administrative boundary only.
            Places, emergency services, descriptions and media remain hidden until their
            evidence and rights records pass publication review.
          </p>
        </div>
      </main>
    </TravelerShell>
  );
}
