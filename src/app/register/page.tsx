import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return <AuthForm mode="register" configured={getAuthStatus().configured} />;
}
