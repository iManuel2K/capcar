import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { CapCarStructuredData } from "@/components/seo/capcar-structured-data";
import {
  canonicalMetadata,
  PUBLIC_SITE_URL,
} from "@/features/seo/public-metadata";

// The canonical homepage is the cacheable English landing page. Localized
// marketing pages live under their explicit locale-prefixed URLs.
export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const [metadata, launch] = await Promise.all([
    getTranslations("Metadata"),
    getTranslations("Launch"),
  ]);
  const title = metadata("siteTitle");
  const description = metadata("siteDescription");
  const canonical = PUBLIC_SITE_URL.toString();
  const shareImage = new URL(
    "/capcar-hero-bmw-garage.png",
    PUBLIC_SITE_URL,
  ).toString();

  return {
    ...canonicalMetadata(""),
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "CapCar",
      images: [
        {
          url: shareImage,
          alt: launch("visual.alt"),
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

export default function Home() {
  return (
    <>
      <CapCarStructuredData />
      <MarketingLanding />
    </>
  );
}
