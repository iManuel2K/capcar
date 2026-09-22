import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { canonicalMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Launch");
  const title = `${t("hero.title")} ${t("hero.accent")}`;
  const description = t("hero.description");
  return {
    ...canonicalMetadata(""),
    title: { absolute: `${title} · CapCar` },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "CapCar",
      images: [
        {
          url: "https://capcar-im.netlify.app/capcar-hero-bmw-garage.png",
          alt: t("visual.alt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://capcar-im.netlify.app/capcar-hero-bmw-garage.png"],
    },
  };
}
export default function Home() {
  return <MarketingLanding />;
}
