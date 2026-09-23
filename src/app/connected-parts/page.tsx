import { CommunityShell } from "@/components/community/community-shell";
import { RetailSearch } from "@/components/community/retail-search";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/features/seo/public-metadata";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Community");
  const description = await getTranslations("PageMeta");
  return pageMetadata(
    "/connected-parts",
    t("connectedTitle"),
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
