"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ResilientPartSearch } from "@/components/parts/resilient-part-search";
import { useBuildState } from "@/features/builds/use-builds";
import { announceBuildChange } from "@/features/builds/build-storage";
import {
  quoteFromRetail,
  updateWorkbench,
} from "@/features/builds/build-workbench";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import {
  deliveredTotal,
  selectBuildOffer,
} from "@/features/retail/build-offer";
import {
  type RetailItem,
  type RetailResponse,
} from "@/features/retail/retail-contracts";

const subscribe = () => () => undefined;
const action =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-current/30 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50";
export function BuildPartsWorkspace({
  vehicleId,
  buildId,
  initialItem,
}: {
  vehicleId: string;
  buildId: string;
  initialItem: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const state = useBuildState();
  const { vehicles } = useVehicles();
  const [selectedId, setSelectedId] = useState(initialItem);
  const build = state.builds.find(
    (entry) => entry.id === buildId && entry.vehicleId === vehicleId,
  );
  const vehicle = vehicles.find((entry) => entry.id === vehicleId);
  const items = state.items.filter(
    (entry) => entry.buildId === buildId && entry.status === "planned",
  );
  const selected = items.find((entry) => entry.id === selectedId) ?? items[0];
  const back = `/garage/${encodeURIComponent(vehicleId)}/builds/${encodeURIComponent(buildId)}`;
  if (!hydrated) return <p role="status">Loading your build…</p>;
  if (!build || !vehicle)
    return (
      <p role="alert">
        Build not found. <Link href="/garage">Return to Garage</Link>
      </p>
    );
  return (
    <div className="space-y-6 pb-16">
      <Link className={action} href={back}>
        ← Back to {build.name}
      </Link>
      <header>
        <h1 className="text-3xl font-medium sm:text-5xl">
          Find the right part for this plan.
        </h1>
        <p className="mt-4 text-white/70">
          {vehicle.make} {vehicle.model} · {vehicle.platform} ·{" "}
          {vehicle.engineCode}. Search text is not a fitment check.
        </p>
      </header>
      {!selected ? (
        <p className="rounded-2xl border border-white/20 p-6">
          Add a planned modification to this build before selecting an offer.
          Ordered and installed records cannot be replaced here.
        </p>
      ) : (
        <>
          <label className="block">
            Planned modification
            <select
              value={selected.id}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-[#111] px-4"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-[2rem] bg-[#eee7d8] p-4 text-[#0e2d30] sm:p-7">
            <ResilientPartSearch
              key={selected.id}
              initialQuery={`${vehicle.make} ${vehicle.platform} ${selected.title}`}
            >
              {(result, input, navigate) => (
                <>
                  <BuildOfferResults
                    key={`${selected.id}:${result.checkedAt}`}
                    result={result}
                    destination={input.destination}
                    vehicleId={vehicleId}
                    buildId={buildId}
                    itemId={selected.id}
                    savedId={selected.selectedOfferId}
                  />
                  <nav aria-label="Search pages" className="mt-4 flex gap-3">
                    {input.page > 0 && (
                      <button
                        className={action}
                        onClick={() =>
                          navigate({ ...input, page: input.page - 1 })
                        }
                      >
                        Previous
                      </button>
                    )}
                    {result.hasMore && input.page < 9 && (
                      <button
                        className={action}
                        onClick={() =>
                          navigate({ ...input, page: input.page + 1 })
                        }
                      >
                        Next
                      </button>
                    )}
                  </nav>
                </>
              )}
            </ResilientPartSearch>
          </div>
        </>
      )}
    </div>
  );
}

function BuildOfferResults({
  result,
  destination,
  vehicleId,
  buildId,
  itemId,
  savedId,
}: {
  result: RetailResponse;
  destination: string;
  vehicleId: string;
  buildId: string;
  itemId: string;
  savedId?: string;
}) {
  const [ids, setIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(
      amount,
    );
  const compared = result.items.filter((item) => ids.includes(item.id));
  function save(item: RetailItem) {
    setError("");
    setMessage("");
    try {
      selectBuildOffer(
        item,
        vehicleId,
        buildId,
        itemId,
        result.checkedAt,
        window.localStorage,
      );
      announceBuildChange();
      setMessage(
        "Offer saved to this modification. Budget updated; no purchase or expense was recorded.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error && !caught.message.startsWith("[")
          ? caught.message
          : "Could not save. Check browser storage and choose an EUR offer with known shipping.",
      );
    }
  }
  function compare(item: RetailItem) {
    try {
      updateWorkbench(
        vehicleId,
        buildId,
        itemId,
        window.localStorage,
        (state, latest) => {
          if (state.purchase || latest.status !== "planned")
            throw new Error("Purchased quotes are preserved.");
          const quote = quoteFromRetail(item, result.checkedAt, destination);
          if (state.quotes.some((entry) => entry.id === quote.id))
            throw new Error(
              "Already saved. Edit the saved quote to confirm its details.",
            );
          return { ...state, quotes: [...state.quotes, quote] };
        },
      );
      announceBuildChange();
      setError("");
      setMessage(
        "Saved to the retailer comparison. Confirm part number and destination charges in the build workbench.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error && !caught.message.startsWith("[")
          ? caught.message
          : "Could not save. The comparison holds up to 12 offers in EUR, GBP or USD.",
      );
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Live eBay observations ·{" "}
        {new Date(result.checkedAt).toLocaleString("en-GB")}. Confirm
        availability, tax and final total at checkout. Affiliate links are
        marked. You purchase from the retailer.
      </p>
      <p className="text-sm">
        Select up to three offers to compare. Fitment, delivery date, seller
        trust and warranty are unverified unless confirmed by the seller or
        manufacturer. No automatic “best value” claim is made from price alone.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-800/30 p-3 text-red-900"
        >
          {error}
        </p>
      )}
      <p role="status" className="text-sm">
        {message}
      </p>
      <Link
        className={action}
        href={`/garage/${vehicleId}/builds/${buildId}#workbench`}
      >
        Open saved retailer comparison
      </Link>
      {compared.length > 0 && (
        <div
          role="region"
          aria-label="Selected offer comparison"
          tabIndex={0}
          className="overflow-x-auto rounded-xl border border-current/20 focus-visible:outline-2"
        >
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="p-3 text-left font-semibold">
              Compare selected offers ({compared.length}/3)
            </caption>
            <thead>
              <tr>
                {[
                  "Offer",
                  "Condition",
                  "Quoted delivered total",
                  "Fitment",
                ].map((text) => (
                  <th key={text} className="p-3" scope="col">
                    {text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compared.map((item) => (
                <tr key={item.id} className="border-t border-current/15">
                  <th scope="row" className="max-w-64 p-3 font-normal">
                    {item.title}
                  </th>
                  <td className="p-3">{item.condition}</td>
                  <td className="p-3">
                    {deliveredTotal(item) === null
                      ? "Shipping unknown"
                      : money(deliveredTotal(item)!, item.currency)}
                  </td>
                  <td className="p-3">Not verified</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!result.items.length && (
        <p className="rounded-xl border border-dashed border-current/30 p-6">
          No offers found. Try an OE number or a shorter part description.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {result.items.map((item) => (
          <article
            key={item.id}
            className="min-w-0 rounded-2xl border border-current/20 bg-white/40 p-5"
          >
            <label className="mb-3 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={ids.includes(item.id)}
                disabled={!ids.includes(item.id) && ids.length >= 3}
                onChange={(event) =>
                  setIds((current) =>
                    event.target.checked
                      ? [...current, item.id].slice(0, 3)
                      : current.filter((id) => id !== item.id),
                  )
                }
              />
              Compare this offer
            </label>
            <h2 className="text-lg font-medium break-words">{item.title}</h2>
            <p className="mt-3">
              {money(item.price, item.currency)} +{" "}
              {item.shipping === null
                ? "unknown shipping"
                : money(item.shipping, item.currency)}{" "}
              shipping
            </p>
            <p className="mt-2 text-sm">
              {item.condition} · {item.country ?? "Seller location unknown"}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={action}
                onClick={() => compare(item)}
              >
                Save to retailer comparison
              </button>
              <a
                className={action}
                href={item.url}
                target="_blank"
                rel={
                  item.affiliate
                    ? "sponsored noopener noreferrer"
                    : "noopener noreferrer"
                }
              >
                {item.affiliate ? "View retailer · affiliate" : "View retailer"}
              </a>
              <button
                type="button"
                className={action}
                onClick={() => save(item)}
                disabled={
                  item.currency !== "EUR" ||
                  item.shipping === null ||
                  savedId === item.id
                }
              >
                {savedId === item.id ? "Saved to plan" : "Select for build"}
              </button>
            </div>
            {(item.currency !== "EUR" || item.shipping === null) && (
              <p className="mt-2 text-xs">
                The build budget uses EUR and requires a known shipping quote.
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
