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
  type BuildQuote,
  type BuildWorkbench as Workbench,
} from "@/features/builds/build-workbench-schema";
import type { BuildItem } from "@/features/builds/build-schema";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import { VehicleDocuments } from "@/components/passport/vehicle-documents";

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
  const current = item.workbench ?? { quotes: [], fitment: [], evidence: [] };
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
          extraCharges: number(data, "extraCharges"),
          currency: text(data, "currency"),
          condition: text(data, "condition"),
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
  const visible = current.quotes
    .filter(
      (quote) =>
        !filter ||
        quote.partNumber.toLowerCase().includes(filter.toLowerCase()),
    )
    .toSorted(
      (a, b) =>
        a.currency.localeCompare(b.currency) ||
        (quoteTotal(a) ?? Infinity) - (quoteTotal(b) ?? Infinity),
    );
  return (
    <>
      <div
        className="mb-5 flex flex-wrap gap-2"
        aria-label="Workbench sections"
      >
        {["Compare", "Fitment", "Purchase & install", "Evidence"].map(
          (name) => (
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
          ),
        )}
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
          <Field label="Filter saved quotes by part number">
            <input
              className={control}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </Field>
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
                        <p>
                          Extra charges{" "}
                          {quote.extraCharges === null
                            ? "unknown"
                            : money(quote.extraCharges, quote.currency)}
                        </p>
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
                          Seller: {quote.sellerHistory || "History unconfirmed"}
                        </p>
                        <p>Warranty: {quote.warranty || "Unknown"}</p>
                        <p>Returns: {quote.returns || "Unknown"}</p>
                        <p>Delivery: {quote.delivery || "Unconfirmed"}</p>
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
                    [
                      "extraCharges",
                      "Tax / duties / other · 0 only if confirmed included",
                    ],
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
      {tab === "Fitment" && (
        <div className="space-y-5">
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
                    ["yearFrom", "Production year from"],
                    ["yearTo", "Production year to"],
                    ["note", "What the source establishes / required changes"],
                  ] as const
                ).map(([name, label]) => (
                  <Field key={name} label={label}>
                    <input
                      name={name}
                      className={control}
                      required
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
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-white/80">
      {label}
      {children}
    </label>
  );
}
