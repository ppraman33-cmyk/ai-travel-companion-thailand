import { ProvincePage, type Province } from "@/components/traveler/province-page";
import { TravelerShell } from "@/components/traveler/traveler-shell";
import { runtime } from "@/server/runtime";

export default async function ProvinceRoute({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await runtime.catalog.list({
    kind: "destinations",
    id,
    locale: "en",
    limit: 1,
  });
  const province = result.ok
    ? ((result.value.items[0] as Province | undefined) ?? null)
    : null;
  return (
    <TravelerShell>
      <ProvincePage province={province} />
    </TravelerShell>
  );
}
