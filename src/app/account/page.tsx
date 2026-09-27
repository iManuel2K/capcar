import type { Metadata } from "next";

import { AccountWorkspace } from "@/components/account/account-workspace";
import { getAuthStatus } from "@/features/auth/auth-config";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-4 text-[#f4f5f2] sm:px-7">
      <AccountWorkspace status={getAuthStatus()} />
    </main>
  );
}
