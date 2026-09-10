import { CommunityShell } from "@/components/community/community-shell";
import { VerifiedWork } from "@/components/community/verified-work";
import { GarageAccountBoundary } from "@/components/account/garage-account-boundary";
import { getAuthStatus } from "@/features/auth/auth-config";
import { currentUser } from "@/lib/supabase/current-user";
import { SignInCard } from "@/components/community/sign-in-card";
export const metadata = {
  title: "Verified work | Capcar",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await currentUser();
  return (
    <CommunityShell title="Work with a named specialist.">
      {user ? (
        <GarageAccountBoundary configured={getAuthStatus().configured}>
          <VerifiedWork />
        </GarageAccountBoundary>
      ) : (
        <SignInCard next="/verified-work">
          Request a specialist’s confirmation, follow its status and keep the
          result in your private vehicle record.
        </SignInCard>
      )}
    </CommunityShell>
  );
}
