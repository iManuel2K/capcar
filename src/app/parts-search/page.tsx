import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, PackageSearch } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/marketing/site-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { searchCatalogParts } from "@/features/parts/part-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PartsPage");
  return { title: t("title"), description: t("description") };
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
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 sm:px-8 sm:pt-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-[#0e2d30]/62">
          {t("description")}
        </p>
        <div className="mt-8 max-w-2xl">
          <GlobalPartsSearch key={query} expanded initialQuery={query} />
          <Link
            href={
              query
                ? `/connected-parts?q=${encodeURIComponent(query)}`
                : "/connected-parts"
            }
            className="mt-3 inline-flex min-h-11 items-center text-sm underline"
          >
            {t("liveOffers")} →
          </Link>
        </div>

        <div className="mt-10 flex items-end justify-between gap-5 border-b border-[#0e2d30]/14 pb-4">
          <div>
            <p className="text-xs tracking-[0.14em] text-[#0e2d30]/45 uppercase">
              {query ? t("resultsFor", { query }) : t("prepared")}
            </p>
            <h2 className="mt-1 text-2xl font-medium">
              {t("matching", { count: results.length })}
            </h2>
          </div>
          <span className="hidden text-xs text-[#0e2d30]/45 sm:block">
            {t("conditional")}
          </span>
        </div>

        {results.length ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2">
            {results.map((part) => (
              <article
                key={part.id}
                className="group rounded-[1.75rem] border border-[#0e2d30]/12 bg-white/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#6d0101]/25 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full border border-[#6d0101]/15 bg-[#6d0101]/6 px-3 py-1 text-[10px] font-semibold text-[#6d0101] uppercase">
                    {part.category}
                  </span>
                  <PackageSearch className="size-5 text-[#0e2d30]/25 transition group-hover:text-[#6d0101]" />
                </div>
                <h3 className="mt-5 text-xl font-medium">{part.name}</h3>
                <p className="mt-1 font-mono text-xs text-[#0e2d30]/45">
                  {part.brand} · {part.partNumber}
                </p>
                <p className="mt-4 text-sm leading-6 text-[#0e2d30]/58">
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
                      className="rounded-full bg-[#0e2d30]/6 px-2.5 py-1 text-[10px] font-semibold"
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
                        className="rounded-full bg-[#0e2d30]/6 px-2.5 py-1 text-[10px] font-semibold"
                      >
                        {engine}
                      </span>
                    ))}
                </div>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#0e2d30]/10 pt-4">
                  <span className="text-sm font-semibold">
                    {t("approx")} €{part.estimatedPrice.toLocaleString(locale)}
                  </span>
                  <Link
                    href="/register"
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#6d0101]"
                  >
                    {t("verify")} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5 rounded-[2rem] border border-dashed border-[#0e2d30]/18 p-10 text-center">
            <BadgeCheck className="mx-auto size-6 text-[#6d0101]" />
            <h2 className="mt-4 text-xl font-medium">{t("emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#0e2d30]/55">
              {t("emptyDescription")}
            </p>
          </section>
        )}
        <aside className="mt-8 rounded-2xl border border-[#0e2d30]/12 bg-[#0e2d30] p-5 text-sm leading-6 text-[#e8e6d7]/65">
          <strong className="text-white">{t("noticeTitle")}</strong>{" "}
          {t("notice")}
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
