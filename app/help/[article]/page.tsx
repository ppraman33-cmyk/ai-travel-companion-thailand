import { HelpArticle } from "@/components/traveler/help-article";
import { TravelerShell } from "@/components/traveler/traveler-shell";
export default async function HelpArticlePage({
  params,
}: {
  readonly params: Promise<{ article: string }>;
}) {
  const { article } = await params;
  return (
    <TravelerShell>
      <HelpArticle slug={article} />
    </TravelerShell>
  );
}
