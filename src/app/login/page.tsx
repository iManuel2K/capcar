import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <AuthForm mode="login" configured={getAuthStatus().configured} />;
}
