"use client";
import { useRef, useState, useEffect } from "react";
import type {
  RetailRequest,
  RetailResponse,
} from "@/features/retail/retail-contracts";
import { actionClass, fieldClass } from "./community-shell";
import Link from "next/link";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { saveRetailItem } from "@/features/retail/save-retail-item";
import { announceWishlistChange } from "@/features/wishlist/wishlist-storage";
export function RetailSearch() {
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
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
      <section className="rounded-2xl border border-[#0e2d30]/20 p-5">
        <label className="block">
          Save results to a vehicle (optional)
          <select
            className={fieldClass}
            value={vehicleId}
            onChange={(event) => {
              setVehicleId(event.target.value);
              setSavedMessage("");
            }}
          >
            <option value="">Choose vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ·{" "}
                {vehicle.nickname || vehicle.productionYear}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm">
          Searching and merchant checkout do not require a vehicle. Saving does
          not confirm fitment or place an order.
        </p>
        {vehicleId && (
          <Link
            className="inline-flex min-h-11 items-center underline"
            href={`/garage/${vehicleId}/wishlist`}
          >
            Manage saved / ordered / delivered parts →
          </Link>
        )}
        <p role="status">{savedMessage}</p>
      </section>
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
                <button
                  type="button"
                  className={actionClass}
                  disabled={
                    !vehicles.some((vehicle) => vehicle.id === vehicleId)
                  }
                  onClick={() => {
                    try {
                      saveRetailItem(
                        item,
                        vehicleId,
                        result.checkedAt,
                        localStorage,
                      );
                      announceWishlistChange();
                      setSavedMessage(
                        "Saved to this vehicle’s wishlist. Existing duplicates were kept unchanged.",
                      );
                    } catch {
                      setSavedMessage(
                        "Could not save this listing. Check your selected vehicle and browser storage.",
                      );
                    }
                  }}
                >
                  Save to vehicle
                </button>
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
