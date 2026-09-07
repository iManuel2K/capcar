import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export const metadata: Metadata = { title: "Choose new password" };
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <AuthForm mode="reset" configured={getAuthStatus().configured} />;
}
