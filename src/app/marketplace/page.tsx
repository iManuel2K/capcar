import { Marketplace } from "@/components/community/marketplace";
import { PublicMarketplace } from "@/components/community/public-marketplace";
import { currentUser } from "@/lib/supabase/current-user";
import { CommunityShell } from "@/components/community/community-shell";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/features/seo/public-metadata";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Community");
  const description = await getTranslations("PageMeta");
  return pageMetadata(
    "/marketplace",
    t("marketplaceTitle"),
    description("marketplace"),
    { index: false, follow: false },
  );
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const params = await searchParams;
  const selected =
    typeof params.listing === "string" &&
    /^[0-9a-f-]{36}$/i.test(params.listing)
      ? params.listing
      : "";
  const user = await currentUser();
  return (
    <CommunityShell titleKey="marketplaceTitle">
      {user ? (
        <Marketplace initialListingId={selected} />
      ) : (
        <PublicMarketplace />
      )}
    </CommunityShell>
  );
}
