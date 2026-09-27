import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("reset"), robots: { index: false, follow: false } };
}
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <AuthForm mode="reset" configured={getAuthStatus().configured} />;
}
