import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SpecialistApplications } from "@/components/community/specialist-applications";
import { SignInCard } from "@/components/community/sign-in-card";
import { currentUser } from "@/lib/supabase/current-user";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Hardening.Specialist");
  return { title: t("title"), robots: { index: false, follow: false } };
}
export default async function Page() {
  const [user, t] = await Promise.all([
    currentUser(),
    getTranslations("Hardening.Specialist"),
  ]);
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
        <h1 className="mb-8 text-4xl font-medium tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        {user ? (
          <SpecialistApplications />
        ) : (
          <>
            <p className="mb-6 max-w-3xl leading-7">{t("intro")}</p>
            <SignInCard next="/specialists/apply">{t("signedOut")}</SignInCard>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
