import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/features/seo/public-metadata";

import { AuthForm } from "@/components/auth/auth-form";
import { getAuthStatus } from "@/features/auth/auth-config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const description = await getTranslations("PageMeta");
  return pageMetadata(
    "/forgot-password",
    t("forgot"),
    description("forgot-password"),
    { index: false, follow: true },
  );
}
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" configured={getAuthStatus().configured} />;
}
