"use client";
import { FaviconSearch } from "@/components/unlumen-ui/favicon-search";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

import { publicHref } from "@/features/seo/public-metadata";
import { resolveJournalLocale } from "@/features/journal/routes";

export function GlobalPartsSearch({
  theme = "light",
  expanded = false,
  initialQuery = "",
  destination = "/connected-parts",
}: {
  theme?: "light" | "dark";
  expanded?: boolean;
  initialQuery?: string;
  destination?: "/connected-parts" | "/parts-search";
}) {
  const dark = theme === "dark";
  const locale = resolveJournalLocale(useLocale());
  const t = useTranslations("GlobalSearch");
  const id = useId();
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const reset = () => setPending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  return (
    <form
      action={publicHref(destination, locale)}
      role="search"
      onSubmit={() => setPending(true)}
      aria-busy={pending}
      className={expanded ? "w-full" : "w-52 xl:w-64"}
    >
      <label className="sr-only" htmlFor={id}>
        {t("label")}
      </label>
      <div
        className={`flex min-h-11 items-center rounded-full border px-1 transition focus-within:ring-2 ${dark ? "focus-within:ring-primary/40 border-white/10 bg-white/[0.04]" : "border-foreground/14 bg-card focus-within:ring-primary/25"}`}
      >
        <FaviconSearch
          id={id}
          defaultValue={initialQuery}
          name="q"
          maxLength={80}
          placeholder={t("placeholder")}
          clearLabel={t("clear")}
          inputClassName="border-0 bg-transparent text-sm focus-visible:ring-0"
        />
        <button
          type="submit"
          disabled={pending}
          className={`min-h-12 shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase ${dark ? "text-primary" : "text-primary"}`}
        >
          {pending ? t("searching") : t("find")}
        </button>
      </div>
      <span className="sr-only" role="status">
        {pending ? t("status") : ""}
      </span>
    </form>
  );
}
