import { SiteFooter } from "@/components/marketing/site-footer";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShowcaseBuilds } from "@/components/visualizer/showcase-builds";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("StudioPage");
  return { title: t("eyebrow"), description: t("description") };
}
export default async function StudioPage() {
  const t = await getTranslations("StudioPage");
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            className="inline-flex min-h-11 items-center underline"
            href="/"
          >
            ← {t("back")}
          </Link>
          <p className="mt-10 text-xs font-semibold tracking-widest uppercase">
            Capcar / {t("eyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 mb-10 max-w-xl text-base leading-7">
            {t("description")}
          </p>
          <ShowcaseBuilds />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
