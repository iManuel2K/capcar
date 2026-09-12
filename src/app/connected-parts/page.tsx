import { CommunityShell } from "@/components/community/community-shell";
import { RetailSearch } from "@/components/community/retail-search";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Community");
  return { title: t("connectedTitle") };
}
export default function Page() {
  return (
    <CommunityShell titleKey="connectedTitle">
      <RetailSearch />
    </CommunityShell>
  );
}
