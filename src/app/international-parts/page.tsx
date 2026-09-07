"use client";
import Link from "next/link";
import { useState } from "react";
import { subtotal, type SearchResult } from "@/features/international/search";

export default function InternationalParts() {
  const [result, setResult] = useState<SearchResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field =
    "mt-2 w-full rounded-xl border border-white/20 bg-[#151916] p-3 text-white";
  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setResult(undefined);
    try {
      const response = await fetch("/api/international-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok)
        throw new Error(
          response.status === 400
            ? "Check your search term and postcode."
            : "Search unavailable. Live access needs server credentials and API approval; please retry later.",
        );
      setResult(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/garage" className="text-[#ff667a]">
          ← Garage
        </Link>
        <header className="my-8 rounded-3xl border border-white/10 bg-[#111111] p-8">
          <p className="text-sm text-[#ff667a]">
            Epic 26 · International parts
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
            Search beyond borders.
          </h1>
          <p className="mt-5 max-w-2xl text-white/60">
            Search by part number or exact vehicle and part. Choose where the
            item is located and where it must be delivered. Search text is not a
            compatibility check.
          </p>
        </header>
        <form
          onSubmit={search}
          className="grid gap-4 rounded-3xl border border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className="sm:col-span-2 lg:col-span-3">
            Part or OE number
            <input
              name="query"
              required
              minLength={2}
              maxLength={100}
              placeholder="2011 E90 rear lights or OE number"
              className={field}
            />
          </label>
          <label>
            Item location
            <select name="region" className={field}>
              <option value="DE">Germany</option>
              <option value="EU">European Union</option>
              <option value="EUROPE">Europe</option>
              <option value="WORLD">Worldwide</option>
            </select>
          </label>
          <label>
            Deliver to
            <select name="destination" className={field}>
              {Object.entries({
                DE: "Germany",
                AT: "Austria",
                FR: "France",
                NL: "Netherlands",
                IT: "Italy",
                ES: "Spain",
                PL: "Poland",
                GB: "United Kingdom",
                CH: "Switzerland",
              }).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destination postcode
            <input
              name="postcode"
              required
              minLength={2}
              maxLength={12}
              pattern="[A-Za-z0-9 \-]{2,12}"
              placeholder="Your postcode"
              className={field}
            />
          </label>
          <label>
            Condition
            <select name="condition" className={field}>
              <option value="ALL">All conditions</option>
              <option value="NEW">New</option>
              <option value="USED">Used</option>
            </select>
          </label>
          <button
            disabled={busy}
            className="self-end rounded-xl bg-[#e72d45] p-3 font-semibold text-[#07101d] disabled:opacity-40"
          >
            {busy ? "Searching…" : "Search offers"}
          </button>
        </form>
        <div aria-live="polite">
          {error && (
            <p className="mt-6 text-red-200" role="alert">
              {error}
            </p>
          )}
          {result && (
            <>
              <div className="my-6 rounded-xl border border-amber-200/20 p-5">
                <strong>
                  {result.mode === "demo"
                    ? "DEMO — fictional listings"
                    : "LIVE — eBay"}
                </strong>
                <p className="mt-2 text-sm text-white/60">{result.note}</p>
                <p className="mt-2 text-xs text-white/40">
                  Sorted by item + known shipping within each currency. Unknown
                  shipping last. Checked{" "}
                  {new Date(result.checkedAt).toLocaleString()}
                </p>
              </div>
              {result.items.length === 0 && (
                <p>
                  No matches in this result batch. Try a broader region or
                  another part number.
                </p>
              )}
              <section className="grid gap-4 md:grid-cols-2">
                {result.items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-[#111111] p-6"
                  >
                    <p className="text-xs text-[#ff667a]">
                      Item location: {item.country ?? "Unknown"} ·{" "}
                      {item.condition}
                    </p>
                    <h2 className="mt-3 text-xl">{item.title}</h2>
                    <p className="mt-3 text-sm text-white/50">
                      {item.seller}
                      {item.feedback
                        ? ` · ${item.feedback}% positive feedback`
                        : ""}
                    </p>
                    <p className="mt-5 text-2xl">
                      {subtotal(item) === null
                        ? `${item.price.toFixed(2)} ${item.currency} + unknown shipping`
                        : `${subtotal(item)!.toFixed(2)} ${item.currency}`}
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Item {item.price.toFixed(2)} · Shipping{" "}
                      {item.shipping === null
                        ? "unknown"
                        : item.shipping.toFixed(2)}{" "}
                      · Import charges not calculated
                    </p>
                    <p className="mt-3 text-sm text-amber-100/70">
                      Fitment unverified · delivery estimate and returns: check
                      listing
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-block rounded-xl border border-white/20 px-4 py-3"
                      >
                        View on eBay ↗
                      </a>
                    )}
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
