import type { Metadata } from "next";
import { Suspense } from "react";
import type { AppLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

import AutumnLanding from "@/app/autumn/autumn-landing";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { CapCarStructuredData } from "@/components/seo/capcar-structured-data";
import {
  canonicalMetadata,
  PUBLIC_SITE_URL,
  PUBLIC_SITE_NAME,
} from "@/features/seo/public-metadata";

// The canonical homepage is the cacheable English landing page. Localized
// marketing pages live under their explicit locale-prefixed URLs.
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getTranslations("Metadata");
  const title = metadata("siteTitle");
  const description = metadata("siteDescription");
  const canonical = PUBLIC_SITE_URL.toString();
  const shareImage = new URL("/autumn/forest.webp", PUBLIC_SITE_URL).toString();

  return {
    ...canonicalMetadata(""),
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: PUBLIC_SITE_NAME,
      images: [
        {
          url: shareImage,
          alt: "A black BMW on a road through an autumn forest",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
  };
}

export default function Home({ locale = "en" }: { locale?: AppLocale } = {}) {
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
