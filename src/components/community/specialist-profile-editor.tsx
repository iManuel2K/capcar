"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { actionClass, fieldClass } from "./community-shell";
export function SpecialistProfileEditor() {
  const t = useTranslations("Expansion");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <details className="mt-8 rounded-2xl border border-current/20 p-5">
      <summary className="min-h-11 cursor-pointer py-2 font-medium">
        {t("publishProfile")}
      </summary>
      <p className="my-4 text-sm leading-6">{t("profileNote")}</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const data = new FormData(e.currentTarget);
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/specialists/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                summary: data.get("summary"),
                services: data.get("services"),
                area: data.get("area"),
                published: data.get("published") === "on",
              }),
              signal: AbortSignal.timeout(15000),
            });
            if (!response.ok) throw new Error("Rejected");
            setMessage(t("profileSaved"));
          } catch {
            setMessage(t("profileError"));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block">
          {t("summary")}
          <textarea
            name="summary"
            required
            minLength={20}
            maxLength={1000}
            className={fieldClass}
          />
        </label>
        <label className="block">
          {t("services")}
          <input
            name="services"
            required
            minLength={3}
            maxLength={250}
            className={fieldClass}
          />
        </label>
        <label className="block">
          {t("serviceArea")}
          <input
            name="area"
            required
            minLength={2}
            maxLength={150}
            className={fieldClass}
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input
            name="published"
            type="checkbox"
            className="mt-1 size-5 shrink-0"
          />
          {t("publishConsent")}
        </label>
        <button disabled={busy} className={actionClass}>
          {busy ? t("loading") : t("saveProfile")}
        </button>
        <p role="status">{message}</p>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href="/specialists"
        >
          {t("specialists")} →
        </Link>
      </form>
    </details>
  );
}
