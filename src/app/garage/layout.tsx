import { GarageAccountBoundary } from "@/components/account/garage-account-boundary";
import { GarageShell } from "@/components/garage/garage-shell";
import { getAuthStatus } from "@/features/auth/auth-config";

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GarageShell>
      <GarageAccountBoundary configured={getAuthStatus().configured}>
        {children}
      </GarageAccountBoundary>
    </GarageShell>
  );
}
