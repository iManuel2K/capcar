import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("register") };
}
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return <AuthForm mode="register" configured={getAuthStatus().configured} />;
}
