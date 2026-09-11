"use client";

import {
  ArrowUpRight,
  BellRing,
  Link2,
  PackageCheck,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { buildOutboundUrl } from "@/features/affiliate/affiliate-link";
import { proFeatureLabels } from "@/features/pro/pro-features";
import {
  announceWishlistChange,
  removeWishlistItem,
  saveWishlistItem,
  updateWishlistStatus,
  updateWishlistItem,
} from "@/features/wishlist/wishlist-storage";
import {
  wishlistStatuses,
  type WishlistStatus,
  type WishlistItem,
} from "@/features/wishlist/wishlist-schema";
import { useWishlist } from "@/features/wishlist/use-wishlist";
import { useVehicles } from "@/features/vehicles/use-vehicles";

export function WishlistDashboard({ vehicleId }: { vehicleId: string }) {
  const { vehicles } = useVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const items = useWishlist(vehicleId);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<WishlistItem>();

  if (!vehicle) return <MissingVehicle />;

  const total = items.reduce((sum, item) => sum + (item.currentPrice ?? 0), 0);
  const belowTarget = items.filter(
    (item) =>
      item.currentPrice !== undefined &&
      item.targetPrice !== undefined &&
      item.currentPrice <= item.targetPrice,
  ).length;

  return (
    <div className="pb-24 sm:pb-0">
      <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_86%_10%,rgba(231,45,69,0.2),transparent_30%),#111111] p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#ff667a] uppercase">
            Part wishlist
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Save it before you buy it.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base sm:leading-7">
            Keep product links, prices and delivery state connected to your{" "}
            {vehicle.model}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setShowForm((value) => !value);
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> Save part link
        </button>
      </header>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Saved items" value={String(items.length)} />
        <Metric label="Recorded price total" value={formatEuro(total)} />
        <Metric label="At target price" value={String(belowTarget)} />
      </section>

      {(showForm || editing) && (
        <WishlistForm
          key={editing?.id ?? "new"}
          item={editing}
          vehicleId={vehicleId}
          onClose={() => {
            setShowForm(false);
            setEditing(undefined);
          }}
          onError={setError}
        />
      )}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-300/15 bg-red-300/6 p-4 text-sm text-red-100/75"
        >
          {error}
        </p>
      )}

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111111] p-5 sm:p-8">
        <p className="mb-5 text-sm leading-6 text-white/65">
          Prices are your saved values. Edit them when an offer changes; open
          the listing to confirm current price and availability.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.14em] text-white/30 uppercase">
              Purchase queue
            </p>
            <h2 className="mt-2 text-2xl font-medium">
              Saved → ordered → delivered
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ff667a]/20 bg-[#e72d45]/8 px-3 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#ff8796] uppercase">
            <BellRing className="size-3.5" /> Pro ·{" "}
            {proFeatureLabels.automatedPriceDrops}
          </span>
        </div>

        {items.length === 0 ? (
          <EmptyWishlist onAdd={() => setShowForm(true)} />
        ) : (
          <div className="mt-7 grid gap-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/8 bg-[#0c0c0c] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={item.status} />
                      <span className="text-xs text-white/30">
                        {item.merchant}
                      </span>
                    </div>
                    <h3 className="mt-3 truncate text-lg font-medium text-white/90">
                      {item.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                      <span>
                        Recorded{" "}
                        {item.currentPrice === undefined
                          ? "—"
                          : formatEuro(item.currentPrice)}
                      </span>
                      <span>
                        Target{" "}
                        {item.targetPrice === undefined
                          ? "—"
                          : formatEuro(item.targetPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`Status for ${item.title}`}
                      value={item.status}
                      onChange={(event) => {
                        try {
                          updateWishlistStatus(
                            item.id,
                            event.target.value as WishlistStatus,
                            window.localStorage,
                          );
                          announceWishlistChange();
                          setError("");
                        } catch {
                          setError(
                            "Could not update this part. Check browser storage and try again.",
                          );
                        }
                      }}
                      className="min-h-10 rounded-xl border border-white/10 bg-[#171717] px-3 text-xs text-white"
                    >
                      {wishlistStatuses.map((status) => (
                        <option key={status} value={status}>
                          {capitalize(status)}
                        </option>
                      ))}
                    </select>
                    <a
                      href={buildOutboundUrl(item.url, item.id)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/65 hover:text-white"
                    >
                      Open listing <ArrowUpRight className="size-3.5" />
                    </a>
                    <button
                      type="button"
                      className="min-h-11 rounded-xl border border-white/20 px-3 text-xs"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => {
                        setEditing(item);
                        setShowForm(false);
                        setError("");
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Remove ${item.title} from your wishlist?`,
                          )
                        )
                          return;
                        try {
                          removeWishlistItem(item.id, window.localStorage);
                          announceWishlistChange();
                          if (editing?.id === item.id) setEditing(undefined);
                          setError("");
                        } catch {
                          setError(
                            "Could not remove this saved part. Your record has been kept.",
                          );
                        }
                      }}
                      className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/35 hover:text-red-200"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WishlistForm({
  vehicleId,
  onClose,
  onError,
  item,
}: {
  vehicleId: string;
  onClose: () => void;
  onError: (message: string) => void;
  item?: WishlistItem;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const input = {
        vehicleId,
        title: String(form.get("title") ?? ""),
        url: String(form.get("url") ?? ""),
        merchant: String(form.get("merchant") ?? ""),
        currentPrice: form.get("currentPrice")
          ? Number(form.get("currentPrice"))
          : undefined,
        targetPrice: form.get("targetPrice")
          ? Number(form.get("targetPrice"))
          : undefined,
        status: item?.status ?? ("saved" as const),
        note: String(form.get("note") ?? "") || undefined,
      };
      if (item) updateWishlistItem(item.id, input, window.localStorage);
      else saveWishlistItem(input, window.localStorage);
      announceWishlistChange();
      onError("");
      onClose();
    } catch {
      onError(
        "Could not save this part. Use an https:// product link, a part and merchant name, and prices between €0 and €1,000,000. Check that browser storage is available.",
      );
    }
  }
  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-[2rem] border border-[#e72d45]/20 bg-[#151010] p-5 sm:p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          name="title"
          value={item?.title}
          label="Part name"
          placeholder="M-style rear wing"
          required
        />
        <Field
          name="merchant"
          value={item?.merchant}
          label="Merchant"
          placeholder="eBay"
          required
        />
        <Field
          name="url"
          value={item?.url}
          label="Secure product URL"
          placeholder="https://www.ebay.de/..."
          required
          type="url"
          wide
        />
        <Field
          name="currentPrice"
          value={item?.currentPrice}
          label="Current price (€)"
          placeholder="249"
          type="number"
        />
        <Field
          name="targetPrice"
          value={item?.targetPrice}
          label="Target price (€)"
          placeholder="220"
          type="number"
        />
        <Field
          name="note"
          value={item?.note}
          label="Note (optional)"
          placeholder="Part number, finish or delivery details"
          wide
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl border border-white/10 px-4 text-sm text-white/50"
        >
          Cancel
        </button>
        <button className="min-h-11 rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white">
          Save link
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  type = "text",
  wide = false,
  value,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  wide?: boolean;
  value?: string | number;
}) {
  return (
    <label className={`text-xs text-white/45 ${wide ? "md:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        defaultValue={value}
        minLength={required && type === "text" ? 2 : undefined}
        maxLength={
          name === "note"
            ? 300
            : name === "merchant"
              ? 80
              : name === "title"
                ? 120
                : undefined
        }
        max={type === "number" ? 1000000 : undefined}
        type={type}
        required={required}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-[#0b0b0b] px-4 text-sm text-white placeholder:text-white/20 focus:border-[#e72d45] focus:outline-none"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-white/35">{label}</p>
    </article>
  );
}
function StatusPill({ status }: { status: WishlistStatus }) {
  const styles = {
    saved: "border-white/10 bg-white/5 text-white/50",
    ordered: "border-amber-300/20 bg-amber-300/8 text-amber-200",
    delivered: "border-emerald-300/20 bg-emerald-300/8 text-emerald-200",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
}
function EmptyWishlist({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-7 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
      <ShoppingBag className="size-8 text-white/18" />
      <h3 className="mt-5 text-xl font-medium">No saved parts yet</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-white/38">
        Save any secure product link and keep its buying state with the car.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/65"
      >
        <Link2 className="size-4" /> Add first link
      </button>
    </div>
  );
}
function MissingVehicle() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-white/45">
      <PackageCheck className="size-5" /> Vehicle not found.
    </div>
  );
}
function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
