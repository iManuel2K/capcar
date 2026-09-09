"use client";
import { useRef, useState, useEffect } from "react";
import type {
  RetailRequest,
  RetailResponse,
} from "@/features/retail/retail-contracts";
import { actionClass, fieldClass } from "./community-shell";
export function RetailSearch() {
  const [result, setResult] = useState<RetailResponse>();
  const [input, setInput] = useState<RetailRequest>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search(value: RetailRequest) {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError("");
    setResult(undefined);
    setInput(value);
    try {
      const response = await fetch("/api/retail/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
        signal: active.signal,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Search failed.");
      if (!active.signal.aborted) setResult(body);
    } catch (error) {
      if (!active.signal.aborted)
        setError(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      if (!active.signal.aborted) setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">
        Search current eBay listings by exact part number or description. Choose
        a market and delivery country. Purchases are completed at the retailer;
        Capcar does not take payment.
      </p>
      <form
        className="grid gap-4 rounded-2xl border border-[#0e2d30]/20 p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void search({
            query: String(form.get("query")),
            market: form.get("market") as RetailRequest["market"],
            destination: form.get(
              "destination",
            ) as RetailRequest["destination"],
            page: 0,
          });
        }}
      >
        <label className="sm:col-span-2">
          Part number or search phrase
          <input
            name="query"
            required
            minLength={3}
            maxLength={100}
            className={fieldClass}
          />
        </label>
        <label>
          Retailer market
          <select name="market" className={fieldClass}>
            {["DE", "GB", "FR", "IT", "ES", "US"].map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
        <label>
          Delivery country
          <select name="destination" className={fieldClass}>
            {["DE", "AT", "FR", "IT", "ES", "NL", "BE", "GB", "US"].map(
              (code) => (
                <option key={code}>{code}</option>
              ),
            )}
          </select>
        </label>
        <button disabled={busy} className={actionClass}>
          {busy ? "Searching retailer…" : "Search live listings"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <>
          <p role="status">
            {result.items.length} results · checked{" "}
            {new Date(result.checkedAt).toLocaleString()}
          </p>
          <p className="text-sm leading-6">{result.warning}</p>
          {!result.items.length && (
            <p>No matching listings. Try another part number or market.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.items.map((item) => (
              <article
                key={item.id}
                className="space-y-4 rounded-2xl border border-[#0e2d30]/20 p-5"
              >
                <h2 className="text-xl font-medium break-words">
                  {item.title}
                </h2>
                <p>
                  {item.price.toFixed(2)} {item.currency} · shipping{" "}
                  {item.shipping === null
                    ? "not confirmed"
                    : `${item.shipping.toFixed(2)} ${item.currency}`}
                </p>
                <p className="text-sm">
                  {item.condition} · seller location{" "}
                  {item.country ?? "not supplied"}
                </p>
                <p className="text-sm">
                  {item.affiliate
                    ? "Affiliate link: Capcar may earn a commission if you purchase."
                    : "Direct retailer link. No Capcar affiliate campaign applied."}
                </p>
                <a
                  className={`${actionClass} inline-flex items-center`}
                  href={item.url}
                  target="_blank"
                  rel={
                    item.affiliate
                      ? "sponsored noopener noreferrer"
                      : "noopener noreferrer"
                  }
                >
                  View at eBay ↗
                </a>
              </article>
            ))}
          </div>
          <div className="flex gap-3">
            {input && input.page > 0 && (
              <button
                className={actionClass}
                disabled={busy}
                onClick={() => void search({ ...input, page: input.page - 1 })}
              >
                Previous page
              </button>
            )}
            {input && result.hasMore && (
              <button
                className={actionClass}
                disabled={busy}
                onClick={() => void search({ ...input, page: input.page + 1 })}
              >
                Next page
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
