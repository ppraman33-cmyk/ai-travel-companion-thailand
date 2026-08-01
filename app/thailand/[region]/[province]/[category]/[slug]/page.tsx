import { notFound } from "next/navigation";

import { demoProvince, findDemoItem } from "@/application/traveler/synthetic-content";
import { DetailExperience } from "@/components/traveler/detail-experience";
import { TravelerShell } from "@/components/traveler/traveler-shell";

export default async function CategoryDetailPage({
  params,
}: {
  readonly params: Promise<{
    region: string;
    province: string;
    category: string;
    slug: string;
  }>;
}) {
  const { region, province, category, slug } = await params;
  if (region !== demoProvince.region || province !== demoProvince.slug) notFound();
  const item = findDemoItem(category, slug);
  if (!item) notFound();
  return (
    <TravelerShell>
      <DetailExperience item={item} />
    </TravelerShell>
  );
}
