import { CommunityShell } from "@/components/community/community-shell";
import { RetailSearch } from "@/components/community/retail-search";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { publicTitle } from "@/features/seo/public-titles";
import { resolveJournalLocale } from "@/features/journal/routes";
import { pageMetadata } from "@/features/seo/public-metadata";
export async function generateMetadata(): Promise<Metadata> {
  const locale = resolveJournalLocale(await getLocale());
  const description = await getTranslations("PageMeta");
  return pageMetadata(
    "/connected-parts",
    publicTitle(locale, "parts"),
    description("connected-parts"),
  );
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  return (
    <CommunityShell titleKey="connectedTitle">
      <RetailSearch key={query} initialQuery={query} />
    </CommunityShell>
  );
}
