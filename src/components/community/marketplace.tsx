"use client";
import { ListingPhoto, ListingBookmark } from "./marketplace-browser";
import { useState } from "react";
import { useCommunity } from "@/features/community/use-community";
import type { Listing } from "@/features/community/contracts";
import { listingInput } from "@/features/community/contracts";
import { useTranslations } from "next-intl";
import { actionClass, fieldClass } from "./community-shell";
export function Marketplace({
  initialListingId = "",
}: {
  initialListingId?: string;
}) {
  const { data, error, busy, refresh, mutate } = useCommunity();
  const trust = useTranslations("Hardening.Trust");
  const [invalidListing, setInvalidListing] = useState(false);
  const [edit, setEdit] = useState<Listing>();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("published");
  const [condition, setCondition] = useState("all");
  const [selectedListing, setSelectedListing] = useState(initialListingId);
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const moderator = data?.roles.some(
    (role) => role.user_id === data.userId && role.role === "moderator",
  );
  const visibleListings =
    data?.listings.filter(
      (item) =>
        (!selectedListing || item.id === selectedListing) &&
        (view === "mine"
          ? item.seller_id === data.userId
          : view === "review"
            ? moderator && item.status === "pending"
            : item.status === "published") &&
        (condition === "all" || item.condition === condition) &&
        `${item.title} ${item.city} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    ) ?? [];
  return (
    <div className="space-y-8">
      <p className="max-w-3xl leading-7">
        Community listings are reviewed before publication. Seller review is not
        a transaction guarantee. Inspect the part and fitment, use protected
        payment, and never send deposits by gift card or cryptocurrency. CapCar
        does not take payments or provide escrow.
      </p>
      {error && (
        <div role="alert" className="rounded-xl border border-[#6d0101]/40 p-4">
          {error}
        </div>
      )}
      <button
        className={actionClass}
        disabled={busy}
        onClick={() => void refresh()}
      >
        Refresh listings and inbox
      </button>
      {!data && !error && <p role="status">Loading community…</p>}
      {data && (
        <>
          {selectedListing && (
            <div
              role="status"
              className="space-y-3 rounded-2xl border border-[#0e2d30]/25 p-5"
            >
              <p>
                {data.listings.some(
                  (item) =>
                    item.id === selectedListing && item.status === "published",
                )
                  ? "Your selected listing is below. Contact the seller using its private message form."
                  : "That listing is no longer available in the current published results. It may have sold or been removed."}
              </p>
              <button
                type="button"
                className={actionClass}
                onClick={() => {
                  setSelectedListing("");
                  setQuery("");
                  setCondition("all");
                  setView("published");
                }}
              >
                Browse all listings
              </button>
            </div>
          )}
          <details
            open={listingFormOpen || Boolean(edit)}
            onToggle={(event) => setListingFormOpen(event.currentTarget.open)}
            className="rounded-2xl border border-[#0e2d30]/20 p-5"
          >
            <summary className="min-h-11 cursor-pointer py-2 font-medium">
              {edit
                ? "Edit your listing"
                : "Have a part to sell? Create a listing"}
            </summary>
            <form
              key={edit?.id ?? "new"}
              className="space-y-4 rounded-2xl border border-[#0e2d30]/20 p-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const fields = new FormData(form);
                const input = {
                  title: fields.get("title"),
                  description: fields.get("description"),
                  city: fields.get("city"),
                  price_cents: Math.round(Number(fields.get("price")) * 100),
                  condition: fields.get("condition"),
                };
                if (!listingInput.safeParse(input).success) {
                  setInvalidListing(true);
                  return;
                }
                setInvalidListing(false);
                const saved = await mutate(
                  edit ? "edit" : "create",
                  input,
                  edit?.id,
                );
                if (saved) {
                  setEdit(undefined);
                  setListingFormOpen(false);
                  form.reset();
                  setMessage(
                    "Listing saved for moderation. It is not public yet.",
                  );
                }
              }}
            >
              <h2 className="text-2xl font-medium">
                {edit ? "Edit listing · review required again" : "List a part"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Title
                  <input
                    name="title"
                    required
                    minLength={5}
                    maxLength={120}
                    defaultValue={edit?.title}
                    className={fieldClass}
                  />
                </label>
                <label>
                  City only
                  <input
                    name="city"
                    required
                    minLength={2}
                    maxLength={100}
                    defaultValue={edit?.city}
                    className={fieldClass}
                  />
                </label>
                <label>
                  Price in EUR
                  <input
                    name="price"
                    type="number"
                    min="1"
                    max="100000"
                    step="0.01"
                    required
                    defaultValue={edit ? edit.price_cents / 100 : undefined}
                    className={fieldClass}
                  />
                </label>
                <label>
                  Condition
                  <select
                    name="condition"
                    defaultValue={edit?.condition ?? "used"}
                    className={fieldClass}
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="for-parts">For parts / not working</option>
                  </select>
                </label>
              </div>
              <label className="block">
                Description, part number and known defects
                <textarea
                  name="description"
                  required
                  minLength={20}
                  maxLength={3000}
                  defaultValue={edit?.description}
                  className={fieldClass}
                  rows={4}
                />
              </label>
              <p className="text-sm">
                No personal addresses, phone numbers, payment links or external
                contact details. Use the private inbox. List only parts you own
                and can legally sell.
              </p>
              {invalidListing && (
                <p role="alert" className="text-[#6d0101]">
                  {trust("invalid")}
                </p>
              )}
              <button className={actionClass} disabled={busy}>
                Submit for review
              </button>
              {edit && (
                <button
                  type="button"
                  className={`${actionClass} ml-3`}
                  onClick={() => setEdit(undefined)}
                >
                  Cancel edit
                </button>
              )}
            </form>
          </details>
          <p role="status">{message}</p>
          <div className="flex flex-wrap gap-3" aria-label="Listing views">
            {[
              ["published", "Browse published"],
              ["mine", "My listings"],
              ...(moderator ? [["review", "Review queue"]] : []),
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={actionClass}
                aria-pressed={view === value}
                onClick={() => {
                  setSelectedListing("");
                  setView(value);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="block">
            Condition
            <select
              className={fieldClass}
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              <option value="all">All conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="for-parts">For parts / not working</option>
            </select>
          </label>
          <label className="block">
            Search the latest 100 visible listings
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={fieldClass}
              placeholder="Part, city or description"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {visibleListings.map((item) => (
              <article
                key={item.id}
                className="min-w-0 space-y-3 rounded-2xl border border-[#0e2d30]/20 p-5"
              >
                <p className="text-xs uppercase">
                  {item.status} · {item.condition} · {item.city}
                </p>
                <h2 className="text-2xl font-medium break-words">
                  {item.title}
                </h2>
                <ListingPhoto
                  listingId={item.id}
                  title={item.title}
                  owner={
                    item.seller_id === data.userId &&
                    ["pending", "published", "rejected"].includes(item.status)
                  }
                  onUploaded={() => void refresh()}
                />
                <ListingBookmark id={item.id} />
                <p className="text-xl">
                  {(item.price_cents / 100).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
                <p className="break-words whitespace-pre-wrap">
                  {item.description}
                </p>
                <p className="text-sm">
                  Seller:{" "}
                  {data.roles.some(
                    (role) =>
                      role.user_id === item.seller_id &&
                      role.role === "reviewed_seller",
                  )
                    ? "reviewed by a CapCar moderator; not buyer protection"
                    : "identity not reviewed"}
                </p>
                <details className="rounded-xl border border-[#0e2d30]/20 p-3">
                  <summary className="min-h-11 cursor-pointer py-2">
                    Before contacting or paying
                  </summary>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
                    <li>
                      Ask for current photos, exact part numbers and known
                      defects.
                    </li>
                    <li>
                      Verify compatibility independently; a seller badge is not
                      fitment approval.
                    </li>
                    <li>
                      Do not send deposits by gift card or cryptocurrency.
                      CapCar provides no escrow.
                    </li>
                    <li>
                      Keep messages here and report pressure, impersonation or
                      suspicious payment requests.
                    </li>
                  </ul>
                </details>
                {item.seller_id === data.userId ? (
                  <div className="flex flex-wrap gap-2">
                    {["pending", "published"].includes(item.status) && (
                      <>
                        <button
                          className={actionClass}
                          disabled={busy}
                          onClick={() => setEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className={actionClass}
                          disabled={busy}
                          onClick={() => void mutate("withdraw", {}, item.id)}
                        >
                          Withdraw
                        </button>
                        <button
                          className={actionClass}
                          disabled={busy}
                          onClick={() => void mutate("sold", {}, item.id)}
                        >
                          Mark sold
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  item.status === "published" && (
                    <>
                      <ActionForm
                        label="Message seller"
                        name="body"
                        min={5}
                        max={2000}
                        busy={busy}
                        submit={(fields) => mutate("message", fields, item.id)}
                      />
                      <ActionForm
                        label="Report listing"
                        name="reason"
                        min={10}
                        max={1000}
                        busy={busy}
                        submit={(fields) => mutate("report", fields, item.id)}
                      />
                    </>
                  )
                )}
                {moderator && item.seller_id !== data.userId && (
                  <form
                    className="space-y-3 border-t border-[#0e2d30]/20 pt-3"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const fields = new FormData(form);
                      const action = fields.get("decision");
                      const ok = await mutate(
                        action === "review_seller" ||
                          action === "suspend_seller"
                          ? action
                          : "moderate",
                        action === "review_seller" ||
                          action === "suspend_seller"
                          ? { reason: fields.get("reason") }
                          : { reason: fields.get("reason"), status: action },
                        item.id,
                      );
                      if (ok) form.reset();
                    }}
                  >
                    <label>
                      Moderator decision
                      <select name="decision" className={fieldClass}>
                        <option value="rejected">
                          Reject / remove listing
                        </option>
                        <option value="published">Publish listing</option>
                        <option value="review_seller">
                          Record completed seller identity review
                        </option>
                        <option value="suspend_seller">
                          Suspend seller and remove their active listings
                        </option>
                      </select>
                    </label>
                    <label>
                      Review evidence or reason
                      <input
                        name="reason"
                        required
                        minLength={10}
                        maxLength={1000}
                        className={fieldClass}
                      />
                    </label>
                    <button className={actionClass} disabled={busy}>
                      Record decision
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
          {!!data.listings.length && !visibleListings.length && (
            <p role="status">
              No listings match this view. Change the view, condition or search
              phrase.
            </p>
          )}
          {!data.listings.length && (
            <p>
              No listings yet. Your first listing will enter the review queue.
            </p>
          )}
          {moderator && (
            <section>
              <h2 className="text-2xl">Open reports</h2>
              {data.reports.map((report) => (
                <article
                  key={report.id}
                  className="my-4 rounded-xl border border-[#0e2d30]/20 p-4"
                >
                  <p>Listing {report.listing_id}</p>
                  <p className="break-words">{report.reason}</p>
                  <ActionForm
                    label="Close report with reason"
                    name="reason"
                    min={10}
                    max={1000}
                    busy={busy}
                    submit={(fields) =>
                      mutate("close_report", fields, report.id)
                    }
                  />
                </article>
              ))}
            </section>
          )}
          <section>
            <h2 className="text-2xl font-medium">
              Private inbox · latest 100 messages
            </h2>
            {!data.messages.length && <p className="mt-3">No messages yet.</p>}
            {data.messages.map((item) => (
              <article
                key={item.id}
                className="my-4 space-y-3 rounded-xl border border-[#0e2d30]/20 p-4"
              >
                <p className="text-sm">
                  {item.sender_id === data.userId ? "Sent" : "Received"} ·{" "}
                  {new Date(item.created_at).toLocaleString()} · Listing{" "}
                  {item.listing_id}
                </p>
                <p className="break-words whitespace-pre-wrap">{item.body}</p>
                {item.recipient_id === data.userId && (
                  <ActionForm
                    label="Reply"
                    name="body"
                    min={5}
                    max={2000}
                    busy={busy}
                    submit={(fields) => mutate("reply", fields, item.id)}
                  />
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
function ActionForm({
  label,
  name,
  min,
  max,
  busy,
  submit,
}: {
  label: string;
  name: string;
  min: number;
  max: number;
  busy: boolean;
  submit: (
    fields: Record<string, FormDataEntryValue | null>,
  ) => Promise<boolean>;
}) {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const ok = await submit({ [name]: new FormData(form).get(name) });
        if (ok) {
          form.reset();
          setSent(true);
        }
      }}
    >
      <label className="block text-sm">
        {label}
        <textarea
          name={name}
          required
          minLength={min}
          maxLength={max}
          className={fieldClass}
        />
      </label>
      <button className={actionClass} disabled={busy}>
        {label}
      </button>
      {sent && (
        <p role="status" className="text-sm">
          Saved.
        </p>
      )}
    </form>
  );
}
