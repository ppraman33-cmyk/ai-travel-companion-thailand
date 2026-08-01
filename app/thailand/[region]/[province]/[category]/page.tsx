import { notFound } from "next/navigation";

import {
  categoryLabels,
  demoItems,
  demoProvince,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import {
  CategoryChip,
  HeroShell,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";

const categories = Object.keys(categoryLabels) as DemoCategory[];

export default async function CategoryPage({
  params,
}: {
  readonly params: Promise<{ region: string; province: string; category: string }>;
}) {
  const { region, province, category } = await params;
  if (
    region !== demoProvince.region ||
    province !== demoProvince.slug ||
    !categories.includes(category as DemoCategory)
  )
    notFound();
  const typedCategory = category as DemoCategory;
  const items = demoItems.filter((item) => item.category === typedCategory);
  const base = `/thailand/${region}/${province}`;
  return (
    <TravelerShell>
      <SyntheticNotice />
      <HeroShell
        compact
        eyebrow={`${demoProvince.name} · synthetic catalog`}
        title={categoryLabels[typedCategory]}
        description="A responsive listing contract using development-only records."
      />
      <nav aria-label="Categories" className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((entry) => (
          <CategoryChip
            active={entry === typedCategory}
            href={`${base}/${entry}`}
            key={entry}
          >
            {categoryLabels[entry]}
          </CategoryChip>
        ))}
      </nav>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <DemoCard href={`${base}/${category}/${item.slug}`} item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <StatusState
          state="empty"
          title="No eligible demo records"
          description="Real records remain blocked pending provenance and verification."
        />
      )}
    </TravelerShell>
  );
}
