"use client";
import { useState } from "react";
import { useCommunity } from "@/features/community/use-community";
import type { Listing } from "@/features/community/contracts";
import { actionClass, fieldClass } from "./community-shell";
export function Marketplace() {
  const { data, error, busy, refresh, mutate } = useCommunity();
  const [edit, setEdit] = useState<Listing>();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const moderator = data?.roles.some(
    (role) => role.user_id === data.userId && role.role === "moderator",
  );
  return (
    <div className="space-y-8">
      <p className="max-w-3xl leading-7">
        Community listings are reviewed before publication. Seller review is not
        a transaction guarantee. Inspect the part and fitment, use protected
        payment, and never send deposits by gift card or cryptocurrency. Capcar
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
          <form
            key={edit?.id ?? "new"}
            className="space-y-4 rounded-2xl border border-[#0e2d30]/20 p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const fields = new FormData(form);
              const saved = await mutate(
                edit ? "edit" : "create",
                {
                  title: fields.get("title"),
                  description: fields.get("description"),
                  city: fields.get("city"),
                  price_cents: Math.round(Number(fields.get("price")) * 100),
                  condition: fields.get("condition"),
                },
                edit?.id,
              );
              if (saved) {
                setEdit(undefined);
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
          <p role="status">{message}</p>
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
            {data.listings
              .filter((item) =>
                `${item.title} ${item.city} ${item.description}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((item) => (
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
                      ? "reviewed by a Capcar moderator; not buyer protection"
                      : "identity not reviewed"}
                  </p>
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
                          submit={(fields) =>
                            mutate("message", fields, item.id)
                          }
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
