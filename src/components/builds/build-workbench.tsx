"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { useBuildState } from "@/features/builds/use-builds";
import { announceBuildChange } from "@/features/builds/build-storage";
import {
  fitmentEvidenceVerdict,
  quoteTotal,
  saveWorkbenchPurchase,
  selectWorkbenchQuote,
  updateWorkbench,
} from "@/features/builds/build-workbench";
import {
  evidenceSchema,
  quoteSchema,
  recordEvidenceSchema,
  workbenchSchema,
  type BuildQuote,
  type BuildWorkbench as Workbench,
  type PriceSnapshot,
} from "@/features/builds/build-workbench-schema";
import type { BuildItem } from "@/features/builds/build-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { VehicleDocuments } from "@/components/passport/vehicle-documents";
import {
  refreshPriceWatches,
  snapshotTotal,
  togglePriceWatch,
} from "@/features/builds/price-watch";
import {
  announceNotificationChange,
  appendNotifications,
} from "@/features/notifications/notification-storage";

const control =
  "mt-2 min-h-11 w-full rounded-xl border border-white/25 bg-[#101817] px-3 py-2 text-sm text-[#eee7d8] focus-visible:outline-2 focus-visible:outline-offset-2";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40";
const money = (value: number, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(value);
const text = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();
const number = (data: FormData, name: string) =>
  text(data, name) === "" ? null : Number(text(data, name));

export function BuildWorkbench({
  vehicle,
  buildId,
  initialItem,
}: {
  vehicle: Vehicle;
  buildId: string;
  initialItem?: string;
}) {
  const state = useBuildState();
  const items = state.items.filter((item) => item.buildId === buildId);
  const [selectedId, setSelectedId] = useState(initialItem ?? "");
  const item = items.find((entry) => entry.id === selectedId) ?? items[0];
  return (
    <section
      id="workbench"
      className="my-6 scroll-mt-24 rounded-[2rem] border border-white/20 bg-[#0d1918] p-5 text-[#eee7d8] sm:p-8"
    >
      <p className="text-xs tracking-[0.16em] text-[#cda58e] uppercase">
        Compare → purchase → install → remember
      </p>
      <h2 className="mt-3 text-2xl font-medium sm:text-4xl">
        Your modification workbench.
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
        Compare live eBay observations with quotes you record from other
        retailers. Evidence stays attached to the part; dated purchases feed
        Cost Analytics. No automatic checkout or independent fitment
        certification.
      </p>
      {item ? (
        <>
          <label className="my-5 block text-sm">
            Modification
            <select
              className={control}
              value={item.id}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {items.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
            </select>
          </label>
          <ItemWorkbench key={item.id} vehicle={vehicle} item={item} />
        </>
      ) : (
        <p className="mt-5">
          Add your first modification to open the workbench.
        </p>
      )}
    </section>
  );
}

function ItemWorkbench({
  vehicle,
  item,
}: {
  vehicle: Vehicle;
  item: BuildItem;
}) {
  const [tab, setTab] = useState("Compare");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<BuildQuote>();
  const [formVersion, setFormVersion] = useState(0);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("supported-value");
  const current = workbenchSchema.parse(item.workbench ?? {});
  const selected = current.quotes.find(
    (quote) => quote.id === current.selectedQuoteId,
  );
  const purchased = Boolean(current.purchase);
  const locked = purchased || item.status !== "planned";
  const id = useId();
  function save(update: (state: Workbench, item: BuildItem) => Workbench) {
    try {
      updateWorkbench(
        vehicle.id,
        item.buildId,
        item.id,
        window.localStorage,
        update,
      );
      announceBuildChange();
      setError("");
      setMessage("Saved to this build.");
      return true;
    } catch (caught) {
      setMessage("");
      const issues =
        caught && typeof caught === "object" && "issues" in caught
          ? (caught as { issues: { message: string }[] }).issues
          : undefined;
      setError(
        issues?.map((issue) => issue.message).join(" ") ??
          (caught instanceof Error
            ? caught.message
            : "Could not save. Your input is still here."),
      );
      return false;
    }
  }
  function addQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      save((state, latest) => {
        if (state.purchase || latest.status !== "planned")
          throw new Error("Purchased quotes are locked.");
        const quote = quoteSchema.parse({
          id: editing?.id ?? crypto.randomUUID(),
          retailer: text(data, "retailer"),
          title: text(data, "title"),
          url: text(data, "url"),
          partNumber: text(data, "partNumber"),
          price: number(data, "price"),
          shipping: number(data, "shipping"),
          extraCharges: editing?.extraCharges ?? null,
          tax: number(data, "tax"),
          importCharges: number(data, "importCharges"),
          otherCharges: number(data, "otherCharges"),
          currency: text(data, "currency"),
          condition: text(data, "condition"),
          manufacturer: text(data, "manufacturer") || undefined,
          sellerName: text(data, "sellerName") || undefined,
          sellerConfidence: text(data, "sellerConfidence"),
          availability: text(data, "availability"),
          returnWindowDays: number(data, "returnWindowDays") ?? undefined,
          estimatedDeliveryDate:
            text(data, "estimatedDeliveryDate") || undefined,
          destination: text(data, "destination"),
          sellerHistory: text(data, "sellerHistory"),
          warranty: text(data, "warranty"),
          returns: text(data, "returns"),
          delivery: text(data, "delivery"),
          observedAt: new Date().toISOString(),
          origin: "owner-quote",
          affiliate: editing?.affiliate ?? false,
        });
        return {
          ...state,
          quotes: [
            ...state.quotes.filter((entry) => entry.id !== quote.id),
            quote,
          ],
        };
      })
    ) {
      setEditing(undefined);
      setFormVersion((value) => value + 1);
    }
  }
  function checkWatches() {
    let notifications: Parameters<typeof appendNotifications>[0] = [];
    const saved = save((state) => {
      const result = refreshPriceWatches(
        state,
        vehicle,
        `${vehicle.productionYear} ${vehicle.make} ${vehicle.model}`,
        `/garage/${vehicle.id}/builds/${item.buildId}#workbench`,
      );
      notifications = result.notifications;
      return result.workbench;
    });
    if (saved && notifications.length) {
      appendNotifications(notifications, window.localStorage);
      announceNotificationChange();
      setMessage(
        `${notifications.length} price-watch update${notifications.length === 1 ? "" : "s"} added to notifications.`,
      );
    } else if (saved)
      setMessage("Watched offers checked against their latest saved data.");
  }
  const visible = current.quotes
    .filter(
      (quote) =>
        !filter ||
        quote.partNumber.toLowerCase().includes(filter.toLowerCase()),
    )
    .toSorted((a, b) => {
      const rank = (quote: BuildQuote) => {
        const verdict = fitmentEvidenceVerdict(
          quote.partNumber,
          vehicle,
          current.fitment,
        );
        const ranks: Record<
          ReturnType<typeof fitmentEvidenceVerdict>["state"],
          number
        > = {
          exact: 0,
          direct: 0,
          supported: 1,
          modification: 2,
          confirmation: 3,
          unknown: 4,
          conflict: 5,
          incompatible: 6,
        };
        return ranks[verdict.state];
      };
      if (sort === "price") return a.price - b.price;
      if (sort === "fitment") return rank(a) - rank(b);
      if (sort === "delivery")
        return (a.estimatedDeliveryDate ?? "9999").localeCompare(
          b.estimatedDeliveryDate ?? "9999",
        );
      if (sort === "condition") return a.condition.localeCompare(b.condition);
      if (sort === "seller")
        return b.sellerConfidence.localeCompare(a.sellerConfidence);
      if (sort === "warranty")
        return Number(Boolean(b.warranty)) - Number(Boolean(a.warranty));
      if (sort === "retailer") return a.retailer.localeCompare(b.retailer);
      if (sort === "stock") return a.availability.localeCompare(b.availability);
      const evidenceDifference = rank(a) - rank(b);
      const availabilityDifference =
        Number(a.availability === "unavailable") -
        Number(b.availability === "unavailable");
      const sellerDifference =
        Number(b.sellerConfidence === "established") -
        Number(a.sellerConfidence === "established");
      const warrantyDifference =
        Number(Boolean(b.warranty)) - Number(Boolean(a.warranty));
      return (
        evidenceDifference ||
        availabilityDifference ||
        sellerDifference ||
        warrantyDifference ||
        a.currency.localeCompare(b.currency) ||
        (quoteTotal(a) ?? Infinity) - (quoteTotal(b) ?? Infinity)
      );
    });
  return (
    <>
      <div
        className="mb-5 flex flex-wrap gap-2"
        aria-label="Workbench sections"
      >
        {[
          "Compare",
          "Price watch",
          "Fitment",
          "Purchase & install",
          "Evidence",
        ].map((name) => (
          <button
            key={name}
            className={`${button} ${tab === name ? "bg-[#eee7d8] text-[#102f2b]" : ""}`}
            aria-pressed={tab === name}
            onClick={() => {
              setTab(name);
              setError("");
              setMessage("");
            }}
          >
            {name}
          </button>
        ))}
      </div>
      {error && (
        <p
          role="alert"
          className="my-4 rounded-xl border border-red-300/40 p-4 text-red-200"
        >
          {error}
        </p>
      )}
      <p role="status" className="text-sm text-emerald-200">
        {message}
      </p>
      {tab === "Compare" && (
        <div className="space-y-5">
          <Link
            className={button}
            href={`/garage/${vehicle.id}/builds/${item.buildId}/parts?item=${encodeURIComponent(item.id)}`}
          >
            Search live eBay offers
          </Link>
          <p className="text-sm text-white/70">
            Other retailers: add their current quote below. These are
            owner-recorded snapshots, not connected feeds. Sort is by currency
            then known total, not a “best value” endorsement. Different part
            numbers may not be equivalent.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Filter saved quotes by part number">
              <input
                className={control}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </Field>
            <Field label="Sort comparison">
              <select
                className={control}
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="supported-value">Known delivered total</option>
                <option value="price">Item price</option>
                <option value="delivery">Delivery date</option>
                <option value="fitment">Fitment confidence</option>
                <option value="condition">Condition</option>
                <option value="seller">Seller confidence</option>
                <option value="warranty">Warranty evidence</option>
                <option value="retailer">Retailer</option>
                <option value="stock">Availability</option>
              </select>
            </Field>
          </div>
          <div
            className="overflow-x-auto rounded-xl border border-white/20"
            role="region"
            aria-label="Retailer comparison"
            tabIndex={0}
          >
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="p-4 text-left">
                Saved offers · {current.quotes.length}/12
              </caption>
              <thead>
                <tr>
                  {[
                    "Retailer / part",
                    "Total / condition",
                    "Evidence & terms",
                    "Actions",
                  ].map((label) => (
                    <th scope="col" className="p-4" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((quote) => {
                  const verdict = fitmentEvidenceVerdict(
                    quote.partNumber,
                    vehicle,
                    current.fitment,
                  );
                  return (
                    <tr
                      key={quote.id}
                      className="border-t border-white/15 align-top"
                    >
                      <th scope="row" className="max-w-72 p-4 font-normal">
                        <strong>{quote.retailer}</strong>
                        <p className="my-2 break-words">{quote.title}</p>
                        <p>{quote.partNumber || "Part number unconfirmed"}</p>
                        <p className="mt-2 text-xs text-white/60">
                          {quote.origin === "ebay-live"
                            ? "Live eBay observation"
                            : "Owner-recorded quote"}{" "}
                          · {quote.observedAt.slice(0, 10)}
                        </p>
                        <a
                          href={quote.url}
                          target="_blank"
                          rel={
                            quote.affiliate
                              ? "sponsored noopener noreferrer"
                              : "noopener noreferrer"
                          }
                          className="mt-2 inline-flex min-h-11 items-center underline"
                        >
                          Retailer source{quote.affiliate ? " · affiliate" : ""}
                        </a>
                      </th>
                      <td className="p-4">
                        <strong>
                          {quoteTotal(quote) === null
                            ? "Total incomplete"
                            : money(quoteTotal(quote)!, quote.currency)}
                        </strong>
                        <p className="mt-2">
                          Item {money(quote.price, quote.currency)}
                        </p>
                        <p>
                          Shipping{" "}
                          {quote.shipping === null
                            ? "unknown"
                            : money(quote.shipping, quote.currency)}
                        </p>
                        {quote.tax !== undefined ? (
                          <>
                            <p>
                              Tax{" "}
                              {quote.tax === null
                                ? "unknown"
                                : money(quote.tax, quote.currency)}
                            </p>
                            <p>
                              Import{" "}
                              {quote.importCharges === null
                                ? "unknown"
                                : money(
                                    quote.importCharges ?? 0,
                                    quote.currency,
                                  )}
                            </p>
                            <p>
                              Other{" "}
                              {quote.otherCharges === null
                                ? "unknown"
                                : money(
                                    quote.otherCharges ?? 0,
                                    quote.currency,
                                  )}
                            </p>
                          </>
                        ) : (
                          <p>
                            Combined additional charges{" "}
                            {quote.extraCharges === null
                              ? "unknown"
                              : money(quote.extraCharges, quote.currency)}
                          </p>
                        )}
                        <p className="mt-2">{quote.condition}</p>
                        <p className="mt-2">Deliver to: {quote.destination}</p>
                      </td>
                      <td className="max-w-80 space-y-2 p-4">
                        <p
                          className={
                            verdict.state === "direct"
                              ? "text-emerald-200"
                              : ["incompatible", "conflict"].includes(
                                    verdict.state,
                                  )
                                ? "text-red-200"
                                : "text-amber-200"
                          }
                        >
                          {verdict.label}
                        </p>
                        <p>
                          Seller: {quote.sellerName || "Unknown"} ·{" "}
                          {quote.sellerConfidence}
                        </p>
                        <p>
                          {quote.sellerHistory || "Seller history unconfirmed"}
                        </p>
                        <p>
                          Availability: {quote.availability.replace("-", " ")}
                        </p>
                        <p>Warranty: {quote.warranty || "Unknown"}</p>
                        <p>
                          Returns:{" "}
                          {quote.returnWindowDays !== undefined
                            ? `${quote.returnWindowDays} days`
                            : quote.returns || "Unknown"}
                        </p>
                        <p>
                          Delivery:{" "}
                          {(quote.estimatedDeliveryDate ?? quote.delivery) ||
                            "Unconfirmed"}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <button
                            className={button}
                            disabled={
                              locked || current.selectedQuoteId === quote.id
                            }
                            onClick={() =>
                              save((state, latest) =>
                                selectWorkbenchQuote(
                                  state,
                                  latest,
                                  quote.id,
                                  vehicle,
                                ),
                              )
                            }
                          >
                            {current.selectedQuoteId === quote.id
                              ? "Selected"
                              : "Use for plan"}
                          </button>
                          <button
                            className={button}
                            disabled={locked}
                            onClick={() => setEditing(quote)}
                          >
                            Edit / confirm charges
                          </button>
                          <button
                            className={button}
                            disabled={
                              locked || current.selectedQuoteId === quote.id
                            }
                            onClick={() =>
                              save((state) => {
                                if (state.purchase)
                                  throw new Error(
                                    "Purchase evidence is locked.",
                                  );
                                return {
                                  ...state,
                                  quotes: state.quotes.filter(
                                    (entry) => entry.id !== quote.id,
                                  ),
                                };
                              })
                            }
                          >
                            Remove quote
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!visible.length && (
                  <tr>
                    <td colSpan={4} className="p-5">
                      No saved quotes match. Add a retailer quote or save a live
                      search result.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!locked && (
            <details open={Boolean(editing)}>
              <summary className="cursor-pointer py-3 font-medium">
                {editing ? "Edit quote" : "Add another retailer quote"}
              </summary>
              <form
                key={`${editing?.id ?? "new"}:${formVersion}`}
                onSubmit={addQuote}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Field label="Retailer">
                  <input
                    className={control}
                    name="retailer"
                    required
                    maxLength={80}
                    defaultValue={editing?.retailer}
                  />
                </Field>
                <Field label="Part / listing title">
                  <input
                    className={control}
                    name="title"
                    required
                    minLength={2}
                    maxLength={500}
                    defaultValue={editing?.title ?? item.title}
                  />
                </Field>
                <Field label="Exact manufacturer part number">
                  <input
                    className={control}
                    name="partNumber"
                    maxLength={80}
                    defaultValue={editing?.partNumber}
                  />
                </Field>
                <Field label="Part manufacturer">
                  <input
                    className={control}
                    name="manufacturer"
                    maxLength={80}
                    defaultValue={editing?.manufacturer}
                  />
                </Field>
                <Field label="Retailer source URL">
                  <input
                    className={control}
                    name="url"
                    type="url"
                    required
                    defaultValue={editing?.url}
                  />
                </Field>
                <Field label="Currency">
                  <select
                    className={control}
                    name="currency"
                    defaultValue={editing?.currency ?? "EUR"}
                  >
                    {["EUR", "GBP", "USD"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Condition">
                  <input
                    className={control}
                    name="condition"
                    required
                    maxLength={80}
                    defaultValue={editing?.condition}
                  />
                </Field>
                {(
                  [
                    ["price", "Item price"],
                    ["shipping", "Shipping · blank if unknown"],
                    ["tax", "Estimated tax · blank if unknown"],
                    ["importCharges", "Import charges · blank if unknown"],
                    ["otherCharges", "Other charges · blank if unknown"],
                  ] as const
                ).map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      className={control}
                      name={name}
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      required={name === "price"}
                      defaultValue={editing?.[name] ?? ""}
                    />
                  </Field>
                ))}
                <Field label="Delivery country / postcode for this quote">
                  <input
                    className={control}
                    name="destination"
                    required
                    minLength={2}
                    maxLength={80}
                    defaultValue={
                      editing?.destination === "Unconfirmed"
                        ? ""
                        : editing?.destination
                    }
                  />
                </Field>
                <Field label="Availability">
                  <select
                    className={control}
                    name="availability"
                    defaultValue={editing?.availability ?? "unknown"}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="in-stock">In stock</option>
                    <option value="low-stock">Low stock</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </Field>
                <Field label="Seller name">
                  <input
                    className={control}
                    name="sellerName"
                    maxLength={100}
                    defaultValue={editing?.sellerName}
                  />
                </Field>
                <Field label="Seller confidence">
                  <select
                    className={control}
                    name="sellerConfidence"
                    defaultValue={editing?.sellerConfidence ?? "unknown"}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="limited">Limited history</option>
                    <option value="established">Established history</option>
                  </select>
                </Field>
                <Field label="Return window · days">
                  <input
                    className={control}
                    name="returnWindowDays"
                    type="number"
                    min="0"
                    max="365"
                    defaultValue={editing?.returnWindowDays}
                  />
                </Field>
                <Field label="Estimated delivery date">
                  <input
                    className={control}
                    name="estimatedDeliveryDate"
                    type="date"
                    defaultValue={editing?.estimatedDeliveryDate}
                  />
                </Field>
                {(
                  [
                    ["sellerHistory", "Seller history / review source"],
                    ["warranty", "Warranty terms"],
                    ["returns", "Return terms"],
                    ["delivery", "Quoted delivery window"],
                  ] as const
                ).map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      className={control}
                      name={name}
                      maxLength={200}
                      defaultValue={editing?.[name]}
                    />
                  </Field>
                ))}
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button className={button} type="submit">
                    Save quote
                  </button>
                  {editing && (
                    <button
                      type="button"
                      className={button}
                      onClick={() => setEditing(undefined)}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </details>
          )}
        </div>
      )}
      {tab === "Price watch" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium">Watched offers</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Capcar checks these watches when you refresh their latest saved
                offer data. Continuous background monitoring and email alerts
                are not claimed.
              </p>
            </div>
            <button
              className={button}
              type="button"
              disabled={!current.watches.length}
              onClick={checkWatches}
            >
              Check watched prices
            </button>
          </div>
          {current.quotes.map((quote) => {
            const watch = current.watches.find(
              (entry) => entry.quoteId === quote.id,
            );
            return (
              <article
                key={quote.id}
                className="rounded-2xl border border-white/15 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium">{quote.title}</h4>
                    <p className="mt-1 text-sm text-white/55">
                      {quote.retailer} ·{" "}
                      {quote.partNumber || "part number unconfirmed"}
                    </p>
                    <p className="mt-1 text-sm">
                      {quoteTotal(quote) === null
                        ? "Delivered total incomplete"
                        : money(quoteTotal(quote)!, quote.currency)}
                    </p>
                  </div>
                  <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      save((state) =>
                        togglePriceWatch(
                          state,
                          quote,
                          number(data, "targetPrice") ?? undefined,
                        ),
                      );
                    }}
                  >
                    {!watch && (
                      <Field label="Target delivered price · optional">
                        <input
                          className={control}
                          name="targetPrice"
                          type="number"
                          min="0"
                          max="1000000"
                          step="0.01"
                        />
                      </Field>
                    )}
                    <button className={button} type="submit">
                      {watch ? "Stop watching" : "Watch offer"}
                    </button>
                  </form>
                </div>
                {watch && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-xs text-white/45">
                      Target{" "}
                      {watch.targetPrice === undefined
                        ? "not set"
                        : money(watch.targetPrice, quote.currency)}{" "}
                      · last checked{" "}
                      {watch.checkedAt
                        ? new Date(watch.checkedAt).toLocaleString("en-GB")
                        : "not yet"}
                    </p>
                    <PriceHistory
                      snapshots={watch.snapshots}
                      currency={quote.currency}
                    />
                  </div>
                )}
              </article>
            );
          })}
          {!current.quotes.length && (
            <p className="rounded-2xl border border-dashed border-white/20 p-6 text-white/60">
              Save an offer to the retailer comparison before watching its
              price.
            </p>
          )}
        </div>
      )}
      {tab === "Fitment" && (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {current.quotes.map((quote) => {
              const verdict = fitmentEvidenceVerdict(
                quote.partNumber,
                vehicle,
                current.fitment,
              );
              return (
                <article
                  key={quote.id}
                  className="rounded-2xl border border-white/15 bg-black/15 p-5"
                >
                  <p className="text-xs text-white/40 uppercase">
                    Fitment decision
                  </p>
                  <h3 className="mt-2 text-lg font-medium">{quote.title}</h3>
                  <p
                    className={`mt-3 font-medium ${["direct", "exact", "supported"].includes(verdict.state) ? "text-emerald-200" : ["conflict", "incompatible"].includes(verdict.state) ? "text-red-200" : "text-amber-200"}`}
                  >
                    {verdict.label}
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    {verdict.nextAction}
                  </p>
                  <dl className="mt-4 grid gap-2 text-sm">
                    <div>
                      <dt className="text-white/35">Matched</dt>
                      <dd>
                        {verdict.matchedAxes.join(", ") || "None established"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/35">Missing</dt>
                      <dd>
                        {verdict.missingAxes.join(", ") ||
                          "No required axes missing"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/35">Conflicts</dt>
                      <dd>
                        {verdict.conflicts.join(" versus ") || "None recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/35">Evidence</dt>
                      <dd>
                        {verdict.count} matching source
                        {verdict.count === 1 ? "" : "s"}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
          <p className="text-sm leading-6 text-white/70">
            A listing title is not a fitment check. Record the source’s exact
            part number, chassis, engine, production range, body and
            transmission. Matching fields show a recorded claim, not independent
            verification or road approval. Conflicting claims block offer
            selection.
          </p>
          {current.fitment.map((record) => (
            <article
              className="rounded-xl border border-white/20 p-4"
              key={record.id}
            >
              <h3>
                {record.partNumber} · {record.verdict}
              </h3>
              <p className="mt-2 text-sm">
                {record.make} {record.platform} · {record.engineCode} ·{" "}
                {record.bodyStyle} · {record.transmission} · {record.yearFrom}–
                {record.yearTo}
              </p>
              <p className="my-2 text-sm">{record.note}</p>
              {(record.oeCrossReferences.length > 0 ||
                record.supportingModifications.length > 0) && (
                <p className="my-2 text-sm text-white/60">
                  {record.oeCrossReferences.length > 0 &&
                    `OE references: ${record.oeCrossReferences.join(", ")}. `}
                  {record.supportingModifications.length > 0 &&
                    `Required supporting work: ${record.supportingModifications.join(", ")}.`}
                </p>
              )}
              <a
                className="underline"
                href={record.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {record.source} · owner-recorded {record.kind} source
              </a>
              <button
                className={`${button} ml-3`}
                disabled={purchased}
                onClick={() =>
                  save((state) => {
                    if (state.purchase)
                      throw new Error("Purchased evidence is preserved.");
                    return {
                      ...state,
                      fitment: state.fitment.filter(
                        (entry) => entry.id !== record.id,
                      ),
                    };
                  })
                }
              >
                Remove claim
              </button>
            </article>
          ))}
          {!purchased && (
            <details>
              <summary className="cursor-pointer py-3">
                Record fitment evidence
              </summary>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const form = event.currentTarget;
                  if (
                    save((state) => {
                      if (state.purchase)
                        throw new Error("Purchased evidence is preserved.");
                      const record = evidenceSchema.parse({
                        id: crypto.randomUUID(),
                        kind: text(data, "kind"),
                        source: text(data, "source"),
                        url: text(data, "url"),
                        partNumber: text(data, "partNumber"),
                        make: text(data, "make"),
                        platform: text(data, "platform"),
                        engineCode: text(data, "engineCode"),
                        bodyStyle: text(data, "bodyStyle"),
                        transmission: text(data, "transmission"),
                        yearFrom: number(data, "yearFrom"),
                        yearTo: number(data, "yearTo"),
                        verdict: text(data, "verdict"),
                        fuelType: text(data, "fuelType") || undefined,
                        drivetrain: text(data, "drivetrain") || undefined,
                        axle: text(data, "axle") || undefined,
                        side: text(data, "side") || undefined,
                        position: text(data, "position") || undefined,
                        oeCrossReferences: text(data, "oeCrossReferences")
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                        supportingModifications: text(
                          data,
                          "supportingModifications",
                        )
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                        note: text(data, "note"),
                        recordedAt: new Date().toISOString(),
                      });
                      return { ...state, fitment: [...state.fitment, record] };
                    })
                  )
                    form.reset();
                }}
              >
                <Field label="Source type">
                  <select name="kind" className={control}>
                    <option value="manufacturer">
                      Manufacturer document (owner supplied)
                    </option>
                    <option value="seller">Seller statement</option>
                    <option value="owner">Owner observation</option>
                  </select>
                </Field>
                <Field label="Source says">
                  <select name="verdict" className={control}>
                    <option value="direct">Direct bolt-on</option>
                    <option value="exact">Exact match</option>
                    <option value="supported">Supported match</option>
                    <option value="confirmation">Requires confirmation</option>
                    <option value="modification">Requires modification</option>
                    <option value="incompatible">Incompatible</option>
                  </select>
                </Field>
                {(
                  [
                    ["source", "Source title"],
                    ["url", "Source URL"],
                    ["partNumber", "Exact part number"],
                    ["make", "Make in source"],
                    ["platform", "Chassis in source"],
                    ["engineCode", "Exact engine code in source"],
                    ["bodyStyle", "Body style in source"],
                    ["transmission", "Transmission in source"],
                    ["fuelType", "Fuel type · optional"],
                    ["drivetrain", "Drivetrain · optional"],
                    ["axle", "Axle · optional"],
                    ["side", "Side · optional"],
                    ["position", "Position · optional"],
                    [
                      "oeCrossReferences",
                      "OE cross-references · comma separated",
                    ],
                    [
                      "supportingModifications",
                      "Supporting modifications · comma separated",
                    ],
                    ["yearFrom", "Production year from"],
                    ["yearTo", "Production year to"],
                    ["note", "What the source establishes / required changes"],
                  ] as const
                ).map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      name={name}
                      className={control}
                      required={
                        ![
                          "fuelType",
                          "drivetrain",
                          "axle",
                          "side",
                          "position",
                          "oeCrossReferences",
                          "supportingModifications",
                        ].includes(name)
                      }
                      type={
                        name.startsWith("year")
                          ? "number"
                          : name === "url"
                            ? "url"
                            : "text"
                      }
                      min={name.startsWith("year") ? 1900 : undefined}
                      max={name.startsWith("year") ? 2030 : undefined}
                    />
                  </Field>
                ))}
                <button className={button} type="submit">
                  Save source claim
                </button>
              </form>
            </details>
          )}
        </div>
      )}
      {tab === "Purchase & install" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-white/70">
            {selected
              ? `${selected.retailer} · ${selected.title}`
              : "No comparison quote selected. You can still record a purchase made elsewhere."}{" "}
            Record actual events, not expected dates. A delivered part remains
            “ordered” on legacy screens until installed. Installation is
            owner-recorded, never a verified shop stamp.
          </p>
          <form
            key={current.purchase?.updatedAt ?? "purchase"}
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              save((state) =>
                saveWorkbenchPurchase(
                  {
                    orderedAt: text(data, "orderedAt"),
                    amount: number(data, "amount"),
                    accounting: text(data, "accounting"),
                    refunded: number(data, "refunded") ?? 0,
                    deliveredAt: text(data, "deliveredAt") || undefined,
                    installedAt: text(data, "installedAt") || undefined,
                    mileage: number(data, "mileage") ?? undefined,
                    installer: text(data, "installer") || undefined,
                    updatedAt: new Date().toISOString(),
                  },
                  state,
                ),
              );
            }}
          >
            <Field label="Order date">
              <input
                className={control}
                type="date"
                name="orderedAt"
                required
                defaultValue={current.purchase?.orderedAt}
              />
            </Field>
            <Field label="Actual amount paid · EUR incl. shipping / taxes">
              <input
                className={control}
                name="amount"
                type="number"
                min="0"
                max="1000000"
                step="0.01"
                required
                defaultValue={current.purchase?.amount}
              />
            </Field>
            <Field label="Cost Analytics">
              <select
                className={control}
                name="accounting"
                defaultValue={current.purchase?.accounting ?? "include"}
              >
                <option value="include">Include this purchase once</option>
                <option value="already-recorded">
                  Already entered manually · do not add again
                </option>
              </select>
            </Field>
            <Field label="Refund received · EUR">
              <input
                className={control}
                name="refunded"
                type="number"
                min="0"
                step="0.01"
                defaultValue={current.purchase?.refunded ?? 0}
              />
            </Field>
            <Field label="Actual delivery date · optional">
              <input
                className={control}
                name="deliveredAt"
                type="date"
                defaultValue={current.purchase?.deliveredAt}
              />
            </Field>
            <Field label="Actual installation date · optional">
              <input
                className={control}
                name="installedAt"
                type="date"
                defaultValue={current.purchase?.installedAt}
              />
            </Field>
            <Field label="Odometer at installation · km">
              <input
                className={control}
                name="mileage"
                type="number"
                min="0"
                max="2000000"
                step="1"
                defaultValue={current.purchase?.mileage}
              />
            </Field>
            <Field label="Installed by · private owner record">
              <input
                className={control}
                name="installer"
                maxLength={100}
                defaultValue={current.purchase?.installer}
              />
            </Field>
            <button className={button} type="submit">
              Save actual purchase / progress
            </button>
            <Link className={button} href={`/garage/${vehicle.id}/costs`}>
              Open Cost Analytics
            </Link>
          </form>
        </div>
      )}
      {tab === "Evidence" && (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-white/70">
            Link an uploaded receipt, photo, approval or work record to this
            modification. The filename is a private reference, not proof of
            authenticity. File contents, names, source URLs and installer
            details are excluded from shared Passports.
          </p>
          <label className="block text-sm" htmlFor={`${id}-evidence-kind`}>
            Document category
            <select
              id={`${id}-evidence-kind`}
              className={control}
              defaultValue="receipt"
            >
              <option value="receipt">Receipt</option>
              <option value="photo">Photo</option>
              <option value="approval">Approval</option>
              <option value="work-record">Work record</option>
            </select>
          </label>
          <VehicleDocuments
            vehicleId={vehicle.id}
            onSelect={(documentName) =>
              save((state) => {
                const kind = (
                  document.getElementById(
                    `${id}-evidence-kind`,
                  ) as HTMLSelectElement
                ).value;
                if (
                  state.evidence.some(
                    (record) => record.documentName === documentName,
                  )
                )
                  throw new Error("This document is already linked.");
                const record = recordEvidenceSchema.parse({
                  id: crypto.randomUUID(),
                  kind,
                  label:
                    documentName
                      .split("--")
                      .slice(1)
                      .join("--")
                      .slice(0, 120) || "Vehicle document",
                  documentName,
                  recordedAt: new Date().toISOString(),
                });
                return { ...state, evidence: [...state.evidence, record] };
              })
            }
          />
          <ul className="space-y-3">
            {current.evidence.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/20 p-4"
              >
                <span className="min-w-0 break-all">
                  {record.kind} · {record.label}
                  <small className="block text-white/60">
                    Linked {record.recordedAt.slice(0, 10)} · open the document
                    library to download; deleted files must be relinked.
                  </small>
                </span>
                <button
                  className={button}
                  onClick={() =>
                    save((state) => ({
                      ...state,
                      evidence: state.evidence.filter(
                        (entry) => entry.id !== record.id,
                      ),
                    }))
                  }
                >
                  Unlink
                </button>
              </li>
            ))}
          </ul>
          <Link className={button} href={`/garage/${vehicle.id}/passport`}>
            Review Passport before sharing
          </Link>
        </div>
      )}
    </>
  );
}

function PriceHistory({
  snapshots,
  currency,
}: {
  snapshots: PriceSnapshot[];
  currency: string;
}) {
  const points = snapshots
    .map((snapshot) => ({ snapshot, total: snapshotTotal(snapshot) }))
    .filter((point): point is { snapshot: PriceSnapshot; total: number } =>
      Number.isFinite(point.total),
    );
  if (!points.length)
    return (
      <p className="mt-3 text-sm text-white/45">
        No complete delivered-total snapshot yet.
      </p>
    );
  const maximum = Math.max(...points.map((point) => point.total), 1);
  return (
    <div className="mt-4" aria-label="Delivered price history">
      <div
        className="flex h-20 items-end gap-2"
        role="img"
        aria-label={`${points.length} recorded delivered-price observations`}
      >
        {points.map((point) => (
          <div
            key={point.snapshot.observedAt}
            className="min-w-3 flex-1 rounded-t bg-[#e72d45]"
            style={{
              height: `${Math.max(10, (point.total / maximum) * 100)}%`,
            }}
            title={`${money(point.total, currency)} · ${new Date(point.snapshot.observedAt).toLocaleString("en-GB")}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-white/45">
        {money(points[0].total, currency)} first ·{" "}
        {money(points.at(-1)!.total, currency)} latest
      </p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-white/80">
      {label}
      {children}
    </label>
  );
}
