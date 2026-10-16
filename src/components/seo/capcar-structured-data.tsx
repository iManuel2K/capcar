import { getLocale, getTranslations } from "next-intl/server";

import { buildCapCarStructuredData } from "@/features/seo/structured-data";
import { isAppLocale } from "@/i18n/config";

export async function CapCarStructuredData() {
  const [requestedLocale, t] = await Promise.all([
    getLocale(),
    getTranslations("Metadata"),
  ]);
  const locale = isAppLocale(requestedLocale) ? requestedLocale : "en";
  const data = buildCapCarStructuredData(t("siteDescription"), locale);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
