import type { AppLocale } from "@/i18n/config";

import {
  PUBLIC_SITE_URL,
  PUBLIC_SITE_NAME,
  localizedPublicUrl,
} from "./public-metadata";

export const ORGANIZATION_ID = new URL(
  "/#organization",
  PUBLIC_SITE_URL,
).toString();
export const WEBSITE_ID = new URL("/#website", PUBLIC_SITE_URL).toString();

export function capcarOrganization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "CapCar",
    alternateName: PUBLIC_SITE_NAME,
    url: PUBLIC_SITE_URL.toString(),
    logo: new URL("/capcar-mark-192.png", PUBLIC_SITE_URL).toString(),
  };
}

export function buildCapCarStructuredData(
  description: string,
  locale: AppLocale,
) {
  const organizationId = ORGANIZATION_ID;
  const websiteId = WEBSITE_ID;
  const applicationId = new URL("/#application", PUBLIC_SITE_URL).toString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: PUBLIC_SITE_NAME,
        alternateName: ["CapCar", "capcar.dev"],
        url: PUBLIC_SITE_URL.toString(),
        description,
        publisher: { "@id": organizationId },
      },
      capcarOrganization(),
      {
        "@type": "SoftwareApplication",
        "@id": applicationId,
        name: "CapCar",
        alternateName: PUBLIC_SITE_NAME,
        url: localizedPublicUrl("", locale),
        description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any device with a modern web browser",
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          name: "CapCar core garage beta",
          url: `${localizedPublicUrl("", locale)}#faq`,
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
