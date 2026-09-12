import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
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
  const [t, locale] = await Promise.all([
    getTranslations("CommunityPublic"),
    getLocale(),
  ]);
  let listings: Listing[] = [];
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
      <Link
        className={`${actionClass} my-5 inline-flex items-center`}
        href="/login?next=%2Fmarketplace"
      >
        {t("signInTrade")}
      </Link>
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
        <div className="rounded-2xl border border-dashed border-[#0e2d30]/25 p-8">
          <h2 className="text-xl font-medium">{t("emptyTitle")}</h2>
          <p className="mt-2">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {listings.map((item) => (
            <article
              key={item.id}
              className="min-w-0 rounded-2xl border border-[#0e2d30]/15 bg-white/35 p-6"
            >
              <p className="text-xs uppercase">
                {item.condition} · {item.city}
              </p>
              <h2 className="mt-3 text-2xl font-medium">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 break-words whitespace-pre-wrap">
                {item.description}
              </p>
              <p className="mt-4 font-semibold">
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price_cents / 100)}
              </p>
              <Link
                className={`${actionClass} mt-4 inline-flex items-center`}
                href={`/login?next=${encodeURIComponent(`/marketplace?listing=${item.id}`)}`}
              >
                {t("contact")}
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
