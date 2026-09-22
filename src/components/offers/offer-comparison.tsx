"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeEuro,
  Check,
  Clock3,
  ExternalLink,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { announceBuildChange } from "@/features/builds/build-storage";
import { useBuildState } from "@/features/builds/use-builds";
import type { RankedOffer } from "@/features/offers/offer-catalog";
import { selectOfferForBuild } from "@/features/offers/select-offer";
import { findCatalogPart } from "@/features/parts/part-catalog";
import type { OfferSearchResponse } from "@/features/providers/provider-contracts";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function OfferComparison({
  vehicleId,
  partId,
}: {
  vehicleId: string;
  partId: string;
}) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { vehicles } = useVehicles();
  const state = useBuildState();
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [message, setMessage] = useState("");
  const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
  const part = findCatalogPart(partId);
  const [offers, setOffers] = useState<RankedOffer[]>([]);
  const [providerName, setProviderName] = useState("CapCar offers demo");
  const [source, setSource] = useState<"demo" | "external">("demo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [searchedAt, setSearchedAt] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortMode, setSortMode] = useState<"best" | "price" | "delivery">(
    "best",
  );
  const builds = state.builds.filter((build) => build.vehicleId === vehicleId);
  const sortedOffers = [...offers].sort((a, b) => {
    if (sortMode === "price") return a.deliveredTotal - b.deliveredTotal;
    if (sortMode === "delivery") return a.deliveryDays - b.deliveryDays;
    return (
      Number(b.isBestValue) - Number(a.isBestValue) ||
      a.deliveredTotal - b.deliveredTotal
    );
  });

  useEffect(() => {
    if (!vehicle || !part) return;
    const controller = new AbortController();
    async function loadOffers() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/offers/search", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            partId,
            quantity: 1,
            destinationCountry: "DE",
            currency: "EUR",
          }),
          signal: controller.signal,
        });
        const body = (await response.json()) as
          OfferSearchResponse | { error?: string };
        if (!response.ok || !("offers" in body))
          throw new Error(
            "error" in body && body.error ? body.error : "Offer search failed.",
          );
        setOffers(body.offers);
        setProviderName(body.provider);
        setSource(body.source);
        setWarnings(body.warnings);
        setSearchedAt(body.searchedAt);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error ? caught.message : "Offer search failed.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadOffers();
    return () => controller.abort();
  }, [part, partId, refreshKey, vehicle]);

  if (!hydrated)
    return (
      <div className="min-h-[680px] animate-pulse rounded-[2rem] bg-white/[0.04]" />
    );
  if (!vehicle || !part)
    return (
      <div className="py-32 text-center text-white/45">
        Vehicle or part not found.
      </div>
    );

  function chooseOffer(offerId: string) {
    if (!part || !selectedBuildId) return;
    const offer = offers.find((candidate) => candidate.id === offerId);
    if (!offer) return;
    selectOfferForBuild(part, offer, selectedBuildId, window.localStorage);
    announceBuildChange();
    setMessage(`${offer.merchantName} was connected to your build.`);
  }

  return (
    <div className="pb-24 sm:pb-0">
      <Link
        href={`/garage/${vehicleId}/parts/${partId}`}
        className="mb-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Part details
      </Link>

      <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(231,45,69,0.2),transparent_28%),#111111] p-6 sm:p-10">
        <span className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-[11px] tracking-[0.12em] text-amber-100/70 uppercase">
          {source === "demo" ? "Fictional offers" : "External offers"}
        </span>
        <p className="mt-8 text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
          {vehicle.productionYear} {vehicle.make} {vehicle.model}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          Compare the delivered price.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/45">
          {part.name} · product price, shipping, seller confidence and return
          window in one decision.
        </p>
        <p className="mt-3 text-xs text-white/30">Provider: {providerName}</p>
      </header>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="text-sm text-white/60">
            Add the selected offer to a build
            <select
              value={selectedBuildId}
              onChange={(event) => {
                setSelectedBuildId(event.target.value);
                setMessage("");
              }}
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-white/70 outline-none md:min-w-80"
            >
              <option value="">Select a build</option>
              {builds.map((build) => (
                <option key={build.id} value={build.id}>
                  {build.name}
                </option>
              ))}
            </select>
          </label>
          {builds.length === 0 && (
            <Link
              href={`/garage/${vehicleId}/builds/new`}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-[#07101d]"
            >
              Create a build
            </Link>
          )}
          <label className="text-sm text-white/60">
            Sort offers
            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as typeof sortMode)
              }
              className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] px-4 text-white/70 outline-none"
            >
              <option value="best">Best value</option>
              <option value="price">Lowest total</option>
              <option value="delivery">Fastest delivery</option>
            </select>
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm text-white/55 disabled:opacity-40"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh prices
          </button>
        </div>
        {message && (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-200/75">
            <PackageCheck className="size-4" /> {message}
          </p>
        )}
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        {sortedOffers.map((offer) => (
          <article
            key={offer.id}
            className={`relative overflow-hidden rounded-[2rem] border bg-[#111111] p-6 ${offer.isBestValue ? "border-[#e72d45]/45" : "border-white/10"}`}
          >
            {offer.isBestValue && (
              <span className="absolute top-0 right-0 rounded-bl-2xl bg-[#e72d45] px-4 py-2 text-[11px] font-semibold text-[#07101d]">
                BEST VALUE
              </span>
            )}
            <div className="flex items-center gap-2">
              {offer.isCheapest && (
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] text-emerald-200">
                  CHEAPEST
                </span>
              )}
              <span className="text-xs text-white/30">
                {source === "demo" ? "Demo merchant" : "Provider merchant"}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/35 uppercase">
                {offer.availability.replace("-", " ")}
              </span>
            </div>
            <h2 className="mt-6 text-xl font-medium">{offer.merchantName}</h2>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-medium tracking-[-0.04em]">
                {formatEuro(offer.deliveredTotal)}
              </span>
              <span className="pb-1 text-xs text-white/35">delivered</span>
            </div>
            <dl className="mt-6 divide-y divide-white/8 rounded-2xl border border-white/8 px-4">
              <Row
                icon={BadgeEuro}
                label="Product"
                value={formatEuro(offer.productPrice)}
              />
              <Row
                icon={BadgeEuro}
                label="Subtotal"
                value={formatEuro(offer.subtotal)}
              />
              <Row
                icon={Truck}
                label="Shipping"
                value={
                  offer.shippingPrice === 0
                    ? "Free"
                    : formatEuro(offer.shippingPrice)
                }
              />
              {(offer.requiredExtrasPrice > 0 || offer.estimatedFees > 0) && (
                <Row
                  icon={BadgeEuro}
                  label="Extras + fees"
                  value={formatEuro(
                    offer.requiredExtrasPrice + offer.estimatedFees,
                  )}
                />
              )}
              <Row
                icon={Star}
                label="Seller"
                value={`${offer.sellerRating.toFixed(1)} / 5`}
              />
              <Row
                icon={Sparkles}
                label="Terms"
                value={`${offer.returnsDays}d returns · ${offer.warrantyMonths}m warranty`}
              />
            </dl>
            <button
              type="button"
              disabled={!selectedBuildId}
              onClick={() => chooseOffer(offer.id)}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-4 text-sm font-semibold text-[#07101d] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Check className="size-4" /> Choose this offer
            </button>
            {source === "external" && offer.purchaseUrl && (
              <a
                href={offer.purchaseUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/55"
              >
                Open merchant <ExternalLink className="size-4" />
              </a>
            )}
            <p className="mt-4 flex items-center gap-2 text-[11px] text-white/25">
              <Clock3 className="size-3.5" /> Checked{" "}
              {formatCheckedAt(offer.priceCheckedAt)}
            </p>
          </article>
        ))}
      </section>

      {loading && (
        <div className="mt-5 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.03] py-24 text-center text-sm text-white/30">
          Loading provider offers…
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-300/15 bg-red-300/6 p-5 text-sm text-red-100/70">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      {searchedAt && (
        <p className="mt-4 text-center text-xs text-white/25">
          Epic 22 · {offers.length} offers for delivery to Germany · refreshed{" "}
          {formatCheckedAt(searchedAt)}
        </p>
      )}

      <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/6 p-5 text-sm leading-6 text-white/45">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-200" />
        {source === "demo"
          ? "Prices, merchants, ratings and delivery estimates are fictional UX data. "
          : "Offer data came through the configured external adapter. "}
        {warnings.join(" ")} No purchase is made. Verify real fitment, total
        cost and retailer terms before ordering.
      </aside>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="flex items-center gap-2 text-white/35">
        <Icon className="size-3.5" /> {label}
      </span>
      <span className="text-right text-white/65">{value}</span>
    </div>
  );
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatCheckedAt(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
