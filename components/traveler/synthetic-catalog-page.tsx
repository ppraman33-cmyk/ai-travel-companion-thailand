import {
  categoryLabels,
  demoItems,
  demoProvince,
  type DemoCategory,
} from "@/application/traveler/synthetic-content";
import { DemoCard } from "@/components/traveler/demo-card";
import {
  CategoryChip,
  PageHeader,
  StatusState,
  SyntheticNotice,
} from "@/components/ui/design-system";
export function SyntheticCatalogPage({
  categories,
  title,
  description,
}: {
  readonly categories: readonly DemoCategory[];
  readonly title: string;
  readonly description: string;
}) {
  const items = demoItems.filter((item) => categories.includes(item.category));
  const base = `/thailand/${demoProvince.region}/${demoProvince.slug}`;
  return (
    <div className="reference-page">
      <SyntheticNotice />
      <PageHeader eyebrow="Synthetic catalog" title={title} description={description} />
      <form action="/explore" className="reference-card flex gap-2 p-3" role="search">
        <label className="sr-only" htmlFor={`${categories[0]}-search`}>
          Search {title}
        </label>
        <input
          className="min-h-11 min-w-0 flex-1 rounded-xl px-3"
          id={`${categories[0]}-search`}
          name="q"
          placeholder={`Search ${title.toLowerCase()}`}
        />
        <button className="rounded-xl bg-emerald-800 px-4 font-bold text-white">
          Search
        </button>
      </form>
      <nav aria-label={`${title} categories`} className="flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <CategoryChip href={`${base}/${category}`} key={category}>
            {categoryLabels[category]}
          </CategoryChip>
        ))}
      </nav>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <DemoCard href={`${base}/${item.category}/${item.slug}`} item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <StatusState
          state="empty"
          title="No eligible records"
          description="Verified publication remains unavailable."
        />
      )}
    </div>
  );
}
