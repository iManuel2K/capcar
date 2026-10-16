import type { AppLocale } from "@/i18n/config";

import { PUBLIC_SITE_URL, localizedPublicUrl } from "./public-metadata";

export function buildCapCarStructuredData(
  description: string,
  locale: AppLocale,
) {
  const organizationId = new URL("/#organization", PUBLIC_SITE_URL).toString();
  const applicationId = new URL("/#application", PUBLIC_SITE_URL).toString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "CapCar",
        url: PUBLIC_SITE_URL.toString(),
        logo: new URL("/capcar-mark-192.png", PUBLIC_SITE_URL).toString(),
      },
      {
        "@type": "SoftwareApplication",
        "@id": applicationId,
        name: "CapCar",
        url: localizedPublicUrl("", locale),
        description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any device with a modern web browser",
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        publisher: { "@id": organizationId },
        featureList: [
          "Project car planning",
          "Parts and fitment research",
          "Build cost tracking",
          "Maintenance records",
          "Private digital garage",
        ],
      },
    ],
  };
}
