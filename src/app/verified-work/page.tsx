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
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; specialist?: string }>;
}) {
  const params = await searchParams;
  const vehicle =
    typeof params.vehicle === "string" ? params.vehicle.slice(0, 150) : "";
  const specialist =
    typeof params.specialist === "string" ? params.specialist.slice(0, 36) : "";
  const next = `/verified-work?${new URLSearchParams({ vehicle, specialist })}`;
  const user = await currentUser();
  return (
    <CommunityShell title="Work with a named specialist.">
      {user ? (
        <GarageAccountBoundary configured={getAuthStatus().configured}>
          <VerifiedWork
            initialVehicleId={vehicle}
            initialSpecialistId={specialist}
          />
        </GarageAccountBoundary>
      ) : (
        <SignInCard next={next}>
          Request a specialist’s confirmation, follow its status and keep the
          result in your private vehicle record.
        </SignInCard>
      )}
    </CommunityShell>
  );
}
