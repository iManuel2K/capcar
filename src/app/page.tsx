import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import {
  canonicalMetadata,
  PUBLIC_SITE_URL,
} from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Launch");
  const title = `${t("hero.title")} ${t("hero.accent")}`;
  const description = t("hero.description");
  const canonical = PUBLIC_SITE_URL.toString();
  const shareImage = new URL(
    "/capcar-hero-bmw-garage.png",
    PUBLIC_SITE_URL,
  ).toString();
  return {
    ...canonicalMetadata(""),
    title: { absolute: `${title} · CapCar` },
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
          alt: t("visual.alt"),
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
  return <MarketingLanding />;
}
