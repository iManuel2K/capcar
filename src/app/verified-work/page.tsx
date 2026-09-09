import { CommunityShell } from "@/components/community/community-shell";
import { VerifiedWork } from "@/components/community/verified-work";
import { GarageAccountBoundary } from "@/components/account/garage-account-boundary";
import { getAuthStatus } from "@/features/auth/auth-config";
export const metadata = {
  title: "Verified work | Capcar",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <CommunityShell title="Work with a named specialist.">
      <GarageAccountBoundary configured={getAuthStatus().configured}>
        <VerifiedWork />
      </GarageAccountBoundary>
    </CommunityShell>
  );
}
