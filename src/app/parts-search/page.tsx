import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, PackageSearch } from "lucide-react";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { GlobalPartsSearch } from "@/components/parts/global-parts-search";
import { searchCatalogParts } from "@/features/parts/part-catalog";

export const metadata: Metadata = {
  title: "Global Parts Search",
  description:
    "Search Capcar parts, fitment references and part numbers without creating an account.",
};

export default async function PartsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const values = await searchParams;
  const query =
    typeof values.q === "string" ? values.q.trim().slice(0, 80) : "";
  const results = searchCatalogParts(query);
  return (
    <div className="min-h-dvh bg-[#e8e6d7] text-[#0e2d30]">
      <MarketingHeader />
      <main className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 sm:px-8 sm:pt-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
          Open catalogue · no account required
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl">
          Parts first. Garage later.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-[#0e2d30]/62">
          Search names, part numbers, chassis codes and engine references.
          Capcar shows what each record covers without claiming confirmed
          fitment for an unidentified vehicle.
        </p>
        <div className="mt-8 max-w-2xl">
          <GlobalPartsSearch key={query} expanded initialQuery={query} />
          <Link
            href="/connected-parts"
            className="mt-3 inline-flex min-h-11 items-center text-sm underline"
          >
            Search live retailer offers →
          </Link>
        </div>

        <div className="mt-10 flex items-end justify-between gap-5 border-b border-[#0e2d30]/14 pb-4">
          <div>
            <p className="text-xs tracking-[0.14em] text-[#0e2d30]/45 uppercase">
              {query ? `Results for “${query}”` : "Prepared catalogue"}
            </p>
            <h2 className="mt-1 text-2xl font-medium">
              {results.length} matching part{results.length === 1 ? "" : "s"}
            </h2>
          </div>
          <span className="hidden text-xs text-[#0e2d30]/45 sm:block">
            Fitment remains conditional until a vehicle is selected
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
                    Approx. €{part.estimatedPrice.toLocaleString("de-DE")}
                  </span>
                  <Link
                    href="/register"
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#6d0101]"
                  >
                    Verify with a car <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-5 rounded-[2rem] border border-dashed border-[#0e2d30]/18 p-10 text-center">
            <BadgeCheck className="mx-auto size-6 text-[#6d0101]" />
            <h2 className="mt-4 text-xl font-medium">No catalogue match yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#0e2d30]/55">
              Try a simpler term such as E90, N43, brake, wheel or a complete
              part number. You can also search live retailer offers without an
              account.
            </p>
          </section>
        )}
        <aside className="mt-8 rounded-2xl border border-[#0e2d30]/12 bg-[#0e2d30] p-5 text-sm leading-6 text-[#e8e6d7]/65">
          <strong className="text-white">Fitment notice.</strong> Search results
          are cross-references, not installation approval. Confirm VIN,
          production date, option codes, dimensions and local road approval
          before ordering.
        </aside>
      </main>
    </div>
  );
}
