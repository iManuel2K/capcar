import { Marketplace } from "@/components/community/marketplace";
import { CommunityShell } from "@/components/community/community-shell";
export const metadata = {
  title: "Community marketplace | Capcar",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <CommunityShell title="Parts with a next chapter.">
      <Marketplace />
    </CommunityShell>
  );
}
