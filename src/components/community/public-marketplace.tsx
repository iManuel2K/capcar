import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { MarketplaceBrowser } from "./marketplace-browser";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { actionClass } from "./community-shell";

type Listing = {
  id: string;
  title: string;
  description: string;
  city: string;
  price_cents: number;
  condition: string;
};

export async function PublicMarketplace() {
  const t = await getTranslations("CommunityPublic");
  let listings: Listing[] = [];
  const trust = await getTranslations("Hardening.Trust");
  let unavailable = false;
  try {
    const client = await createClient();
    const { data, error } = await client.rpc("browse_published_listings");
    if (error || !Array.isArray(data)) throw new Error("Browse unavailable");
    listings = data;
  } catch {
    unavailable = true;
  }
  return (
    <section>
      <p className="max-w-2xl leading-7">{t("intro")}</p>
      <details className="my-5 rounded-2xl border border-[#0e2d30]/20 p-5">
        <summary className="min-h-11 cursor-pointer py-2 font-medium">
          {trust("details")}
        </summary>
        <p className="mt-2 max-w-3xl text-sm leading-6">{trust("body")}</p>
      </details>
      {!unavailable && listings.length > 0 && (
        <Link
          className={`${actionClass} my-5 inline-flex items-center`}
          href="/login?next=%2Fmarketplace"
        >
          {t("signInTrade")}
        </Link>
      )}
      {unavailable ? (
        <p role="alert" className="rounded-2xl border border-[#6d0101]/25 p-6">
          {t("loadError")}{" "}
          <Link className="underline" href="/marketplace">
            {t("tryAgain")}
          </Link>{" "}
          {t("or")}{" "}
          <Link className="underline" href="/connected-parts">
            {t("searchRetailers")}
          </Link>
          .
        </p>
      ) : !listings.length ? (
        <div className="overflow-hidden rounded-[2rem] border border-[#0e2d30]/12 bg-[#0e2d30] p-6 text-[#e8e6d7] shadow-[0_24px_70px_rgba(14,45,48,0.12)] sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-[#bf8269]/15 text-[#d6aa92]">
                <PackageOpen className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                {t("emptyTitle")}
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-white/58">
                {t("emptyDescription")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e8e6d7] px-5 text-sm font-semibold text-[#0e2d30] transition hover:-translate-y-0.5"
                href="/login?next=%2Fmarketplace"
              >
                {t("signInTrade")} <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-medium text-white/72 transition hover:border-white/30 hover:text-white"
                href="/connected-parts"
              >
                {t("searchRetailers")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <MarketplaceBrowser listings={listings} />
      )}
    </section>
  );
}
