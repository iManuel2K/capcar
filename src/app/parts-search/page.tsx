import type { Metadata } from "next";
import Link from "@/components/i18n/public-link";
import { ArrowRight, BadgeCheck, PackageSearch } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/marketing/site-footer";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { searchCatalogParts } from "@/features/parts/part-catalog";
import { canonicalMetadata } from "@/features/seo/public-metadata";
import styles from "@/components/marketing/homepage.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PartsPage");
  return {
    ...canonicalMetadata("/parts-search"),
    title: t("title"),
    description: t("description"),
  };
}

export default async function PartsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [t, locale] = await Promise.all([
    getTranslations("PartsPage"),
    getLocale(),
  ]);
  const values = await searchParams;
  const query =
    typeof values.q === "string" ? values.q.trim().slice(0, 80) : "";
  const results = searchCatalogParts(query);
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main
        id="main-content"
        className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 sm:px-8 sm:pt-16"
      >
        <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className={`${styles.pageTitle} mt-4 max-w-4xl`}>{t("title")}</h1>
        <p className="text-foreground/62 mt-5 max-w-2xl leading-7">
          {t("description")}
        </p>
        <div className="mt-8 max-w-2xl">
          <Link
            href={
              query
                ? `/connected-parts?q=${encodeURIComponent(query)}`
                : "/connected-parts"
            }
            className={styles.primary}
          >
            {t("liveOffers")} →
          </Link>
          <div className="mt-6">
            <GlobalPartsSearch
              key={query}
              expanded
              initialQuery={query}
              destination="/parts-search"
            />
          </div>
        </div>

        <div className="border-foreground/14 mt-10 flex items-end justify-between gap-5 border-b pb-4">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
              {query ? t("resultsFor", { query }) : t("prepared")}
            </p>
            <h2 className="mt-1 text-2xl font-medium">
              {t("matching", { count: results.length })}
            </h2>
          </div>
          <span className="text-muted-foreground hidden text-xs sm:block">
            {t("conditional")}
          </span>
        </div>

        {results.length ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2">
            {results.map((part) => (
              <article
                key={part.id}
                className="group border-foreground/12 bg-card hover:border-primary/25 rounded-[1.75rem] border p-5 transition duration-300 hover:-translate-y-1 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="border-primary/15 bg-primary/6 text-primary rounded-full border px-3 py-1 text-[10px] font-semibold uppercase">
                    {part.category}
                  </span>
                  <PackageSearch className="text-muted-foreground group-hover:text-primary size-5 transition" />
                </div>
                <h3 className="mt-5 text-xl font-medium">{part.name}</h3>
                <p className="text-muted-foreground mt-1 font-mono text-xs">
                  {part.brand} · {part.partNumber}
                </p>
                <p className="text-foreground/58 mt-4 text-sm leading-6">
                  {part.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {Array.from(
                    new Set(
                      part.fitmentRules.flatMap((rule) => rule.platforms),
                    ),
                  ).map((platform) => (
                    <span
                      key={platform}
                      className="bg-card/6 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    >
                      {platform}
                    </span>
                  ))}
                  {part.fitmentRules
                    .flatMap((rule) => rule.engineCodes ?? [])
                    .slice(0, 2)
                    .map((engine) => (
                      <span
                        key={engine}
                        className="bg-card/6 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      >
                        {engine}
                      </span>
                    ))}
                </div>
                <div className="border-foreground/10 mt-6 flex items-center justify-between gap-4 border-t pt-4">
                  <span className="text-sm font-semibold">
                    {t("approx")} €{part.estimatedPrice.toLocaleString(locale)}
                  </span>
                  <Link
                    href="/register"
                    className="text-primary inline-flex min-h-10 items-center gap-2 text-sm font-medium"
                  >
                    {t("verify")} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="border-foreground/18 mt-5 rounded-[2rem] border border-dashed p-10 text-center">
            <BadgeCheck className="text-primary mx-auto size-6" />
            <h2 className="mt-4 text-xl font-medium">{t("emptyTitle")}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-6">
              {t("emptyDescription")}
            </p>
          </section>
        )}
        <aside className="border-foreground/12 bg-card text-foreground/65 mt-8 rounded-2xl border p-5 text-sm leading-6">
          <strong className="text-foreground">{t("noticeTitle")}</strong>{" "}
          {t("notice")}
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
