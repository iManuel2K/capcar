import { AnalyticsSettingsButton } from "@/components/analytics/analytics-provider";
import { analyticsUI } from "@/features/analytics/ui";
import { isAppLocale } from "@/i18n/config";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { getLegalConfiguration } from "@/features/legal/legal-config";
import { pageMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalDocs.privacy");
  const description = await getTranslations("PageMeta");
  return pageMetadata("/privacy", t("meta"), description("privacy"));
}

export default async function PrivacyPage() {
  const t = await getTranslations("LegalDocs.privacy");
  const legal = getLegalConfiguration();
  const locale = await getLocale();
  const analytics = analyticsUI[isAppLocale(locale) ? locale : "en"];

  return (
    <LegalShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      {!legal.complete && (
        <p className="border-primary/15 bg-primary/6 text-primary rounded-2xl border p-5">
          {t("blocked")}
        </p>
      )}

      <LegalSection title={t("s1t")}>
        <p>
          {legal.operator || t("operatorPending")}
          <br />
          {legal.address || t("addressPending")}
          <br />
          {t("privacyContact")}: {legal.privacyContact || t("contactPending")}
        </p>
      </LegalSection>

      <LegalSection title={t("s2t")}>
        <p>{t("s2a")}</p>
        <p>{t("s2b")}</p>
        <p>{t("s2c")}</p>
        <p>{t("s2d")}</p>
      </LegalSection>

      <LegalSection title={t("s3t")}>
        <p>{t("s3")}</p>
      </LegalSection>

      <LegalSection title={t("s4t")}>
        <p>{t("s4")}</p>
        <p>{t("s4b")}</p>
        <p>{t("s4c")}</p>
      </LegalSection>

      <LegalSection title={t("s5t")}>
        <p>{t("s5")}</p>
      </LegalSection>

      <LegalSection title={t("s6t")}>
        <p>{t("s6")}</p>
      </LegalSection>

      <LegalSection title={t("s7t")}>
        <p>{t("s7")}</p>
      </LegalSection>

      <LegalSection title={analytics.title}>
        <p>{analytics.notice}</p>
        <AnalyticsSettingsButton />
      </LegalSection>

      <LegalSection title={t("s8t")}>
        <p>{t("s8")}</p>
      </LegalSection>
    </LegalShell>
  );
}
