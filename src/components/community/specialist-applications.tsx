"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  specialistMutation,
  specialistResponse,
  type SpecialistResponse,
} from "@/features/community/specialist-contracts";
import { actionClass, fieldClass } from "./community-shell";
import { createClient } from "@/lib/supabase/client";
import { getAuthStatus } from "@/features/auth/auth-config";

export function SpecialistApplications() {
  const t = useTranslations("Hardening.Specialist");
  const pages = useTranslations("PartsSearch");
  const locale = useLocale();
  const [data, setData] = useState<SpecialistResponse>();
  const [error, setError] = useState<"error" | "saveError" | "signedOut">();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(0);
  const active = useRef<AbortController | null>(null);
  const locked = useRef(false);
  const identity = useRef(0);
  const mutation = useRef<AbortController | null>(null);
  const refresh = useCallback(() => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    return fetch(`/api/specialists/applications?page=${page}`, {
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const parsed = specialistResponse.parse(await response.json());
        if (!controller.signal.aborted) {
          setData(parsed);
          setError(undefined);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setData(undefined);
          setError("error");
        }
      });
  }, [page]);
  const invalidate = useCallback(() => {
    identity.current++;
    active.current?.abort();
    mutation.current?.abort();
  }, []);
  useEffect(() => {
    void refresh();
    const subscription = getAuthStatus().configured
      ? createClient().auth.onAuthStateChange((event) => {
          if (event !== "SIGNED_OUT" && event !== "SIGNED_IN") return;
          identity.current++;
          active.current?.abort();
          mutation.current?.abort();
          setData(undefined);
          setSaved(false);
          if (event === "SIGNED_OUT") setError("signedOut");
          else void refresh();
        }).data.subscription
      : undefined;
    return () => {
      invalidate();
      subscription?.unsubscribe();
    };
  }, [refresh, invalidate]);
  async function submit(input: unknown) {
    if (locked.current) return;
    const parsed = specialistMutation.safeParse(input);
    if (!parsed.success) {
      setError("saveError");
      return;
    }
    locked.current = true;
    const generation = identity.current;
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true);
    setSaved(false);
    setError(undefined);
    try {
      const response = await fetch("/api/specialists/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15_000),
        ]),
      });
      if (!response.ok) throw new Error("Rejected");
      if (identity.current !== generation) return;
      setSaved(true);
      await refresh();
    } catch {
      if (identity.current === generation) setError("saveError");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const own = data?.applications.find((item) => item.user_id === data.userId);
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">{t("intro")}</p>
      <p className="max-w-3xl text-sm leading-6">{t("privacy")}</p>
      {error && (
        <div role="alert" className="rounded-xl border border-[#6d0101]/40 p-4">
          <p>{t(error)}</p>
          <button
            className={`${actionClass} mt-3`}
            disabled={busy}
            onClick={() => void refresh()}
          >
            {t("retry")}
          </button>
        </div>
      )}
      {!data && !error && <p role="status">{t("loading")}</p>}
      <p role="status">{busy ? t("saving") : saved ? t("saved") : ""}</p>
      {data && (!own || own.status === "rejected") && (
        <form
          className="grid gap-4 rounded-2xl border border-[#0e2d30]/20 p-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            void submit({
              action: "apply",
              data: {
                business_name: fields.get("business_name"),
                city: fields.get("city"),
                website: fields.get("website"),
                expertise: fields.get("expertise"),
                consent: fields.get("consent") === "on",
              },
            });
          }}
        >
          {own && <p className="sm:col-span-2">{t("resubmit")}</p>}
          <label>
            {t("business")}
            <input
              className={fieldClass}
              name="business_name"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={100}
              defaultValue={own?.business_name}
            />
          </label>
          <label>
            {t("city")}
            <input
              className={fieldClass}
              name="city"
              autoComplete="address-level2"
              required
              minLength={2}
              maxLength={100}
              defaultValue={own?.city}
            />
          </label>
          <label className="sm:col-span-2">
            {t("website")}
            <input
              className={fieldClass}
              type="url"
              name="website"
              autoComplete="url"
              required
              maxLength={300}
              pattern="https://.*"
              defaultValue={own?.website}
            />
          </label>
          <label className="sm:col-span-2">
            {t("expertise")}
            <textarea
              className={fieldClass}
              name="expertise"
              required
              minLength={20}
              maxLength={2000}
              rows={5}
              defaultValue={own?.expertise}
            />
          </label>
          <label className="flex min-h-11 items-start gap-3 leading-6 sm:col-span-2">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 size-5 shrink-0 accent-[#0e2d30]"
            />
            {t("consent")}
          </label>
          <button
            className={`${actionClass} bg-[#0e2d30] text-[#f3eee2] sm:col-span-2`}
            disabled={busy}
          >
            {busy ? t("saving") : t("submit")}
          </button>
        </form>
      )}
      {data && (
        <section className="space-y-4" aria-label={t("status")}>
          <h2 className="text-2xl font-medium">
            {data.moderator ? t("queue") : t("status")}
          </h2>
          {data.moderator && (
            <p className="max-w-3xl text-sm leading-6">{t("reviewNote")}</p>
          )}
          {!data.applications.length && <p>{t("empty")}</p>}
          {data.applications.map((item) => (
            <article
              key={item.id}
              className="min-w-0 space-y-3 rounded-2xl border border-[#0e2d30]/20 bg-white/30 p-5 break-words"
            >
              <p className="text-sm font-medium">
                {t(item.status)} ·{" "}
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(new Date(item.updated_at))}
              </p>
              <h3 className="text-xl font-medium">{item.business_name}</h3>
              <p>{item.city}</p>
              <p className="whitespace-pre-wrap">{item.expertise}</p>
              <a
                className="inline-flex min-h-11 items-center underline"
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("websiteLabel")} ↗
              </a>
              {item.review_reason && (
                <p className="rounded-xl bg-[#0e2d30]/5 p-3 whitespace-pre-wrap">
                  {item.review_reason}
                </p>
              )}
              {data.moderator &&
                item.user_id !== data.userId &&
                ["pending", "approved"].includes(item.status) && (
                  <form
                    className="space-y-3 border-t border-[#0e2d30]/20 pt-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const fields = new FormData(event.currentTarget);
                      void submit({
                        action: "review",
                        id: item.id,
                        status: fields.get("status"),
                        reason: fields.get("reason"),
                      });
                    }}
                  >
                    <label className="block">
                      {t("decision")}
                      <select
                        name="status"
                        className={fieldClass}
                        defaultValue={
                          item.status === "approved" ? "revoked" : "rejected"
                        }
                      >
                        {item.status === "approved" ? (
                          <option value="revoked">{t("revoke")}</option>
                        ) : (
                          <>
                            <option value="rejected">{t("reject")}</option>
                            <option value="approved">{t("approve")}</option>
                          </>
                        )}
                      </select>
                    </label>
                    <label className="block">
                      {t("evidence")}
                      <textarea
                        name="reason"
                        className={fieldClass}
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={3}
                      />
                    </label>
                    <button className={actionClass} disabled={busy}>
                      {t("record")}
                    </button>
                  </form>
                )}
            </article>
          ))}
          <nav className="flex flex-wrap gap-3" aria-label={pages("pages")}>
            {data.page > 0 && (
              <button
                className={actionClass}
                disabled={busy}
                onClick={() => setPage(data.page - 1)}
              >
                {pages("previous")}
              </button>
            )}
            {data.hasMore && (
              <button
                className={actionClass}
                disabled={busy}
                onClick={() => setPage(data.page + 1)}
              >
                {pages("next")}
              </button>
            )}
          </nav>
        </section>
      )}
    </div>
  );
}
