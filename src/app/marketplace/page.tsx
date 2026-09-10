import { Marketplace } from "@/components/community/marketplace";
import { PublicMarketplace } from "@/components/community/public-marketplace";
import { currentUser } from "@/lib/supabase/current-user";
import { CommunityShell } from "@/components/community/community-shell";
export const metadata = {
  title: "Community marketplace | Capcar",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentUser();
  return (
    <CommunityShell title="Parts with a next chapter.">
      {user ? <Marketplace /> : <PublicMarketplace />}
    </CommunityShell>
  );
}
