import { Suspense } from "react";
import type { AppLocale } from "@/i18n/config";
import AutumnLanding from "@/app/autumn/autumn-landing";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { CapCarStructuredData } from "@/components/seo/capcar-structured-data";

export function HomepageContent({
  locale = "en",
}: { locale?: AppLocale } = {}) {
  return (
    <>
      <Suspense fallback={null}>
        <CapCarStructuredData />
      </Suspense>
      {locale === "en" ? (
        <AutumnLanding />
      ) : (
        <MarketingLanding locale={locale} />
      )}
    </>
  );
}
