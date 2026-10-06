import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { pageMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalDocs.terms");
  const description = await getTranslations("PageMeta");
  return pageMetadata("/terms", t("meta"), description("terms"));
}

export default async function TermsPage() {
  const t = await getTranslations("LegalDocs.terms");
  return (
    <LegalShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <LegalSection title={t("s1t")}>
        <p>{t("s1")}</p>
      </LegalSection>

      <LegalSection title={t("s2t")}>
        <p>{t("s2a")}</p>
        <p>{t("s2b")}</p>
      </LegalSection>

      <LegalSection title={t("s3t")}>
        <p>{t("s3")}</p>
      </LegalSection>

      <LegalSection title={t("s4t")}>
        <p>{t("s4")}</p>
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

      <LegalSection title={t("s8t")}>
        <p>{t("s8")}</p>
      </LegalSection>

      <LegalSection title={t("s9t")}>
        <p>{t("s9")}</p>
      </LegalSection>
    </LegalShell>
  );
}
