import { CommunityShell } from "@/components/community/community-shell";
import { RetailSearch } from "@/components/community/retail-search";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Community");
  return { title: t("connectedTitle") };
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
