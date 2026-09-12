import { CommunityShell } from "@/components/community/community-shell";
import { RetailSearch } from "@/components/community/retail-search";
export const metadata = { title: "Connected parts | Capcar" };
export default function Page() {
  return (
    <CommunityShell titleKey="connectedTitle">
      <RetailSearch />
    </CommunityShell>
  );
}
