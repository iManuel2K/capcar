import Link from "next/link";
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
      <p className="max-w-2xl leading-7">
        Browse published listings freely. Sign in to list a part, contact a
        seller or report a concern. A published listing is not a guarantee of
        fitment or seller reliability.
      </p>
      <Link
        className={`${actionClass} my-5 inline-flex items-center`}
        href="/login?next=%2Fmarketplace"
      >
        Sign in to buy or sell
      </Link>
      {unavailable ? (
        <p role="alert" className="rounded-2xl border border-[#6d0101]/25 p-6">
          Listings could not load.{" "}
          <Link className="underline" href="/marketplace">
            Try again
          </Link>{" "}
          or{" "}
          <Link className="underline" href="/connected-parts">
            search retailers
          </Link>
          .
        </p>
      ) : !listings.length ? (
        <div className="rounded-2xl border border-dashed border-[#0e2d30]/25 p-8">
          <h2 className="text-xl font-medium">No published listings yet.</h2>
          <p className="mt-2">
            Have a spare part? Sign in to submit the first listing for review.
          </p>
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
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(item.price_cents / 100)}
              </p>
              <Link
                className={`${actionClass} mt-4 inline-flex items-center`}
                href="/login?next=%2Fmarketplace"
              >
                Sign in to contact seller
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
