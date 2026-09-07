import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" configured={getAuthStatus().configured} />;
}
