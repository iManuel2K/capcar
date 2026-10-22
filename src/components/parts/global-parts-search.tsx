"use client";
import { Search } from "lucide-react";
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
        className={`flex min-h-11 items-center rounded-full border px-3 transition focus-within:ring-2 ${dark ? "focus-within:ring-primary/40 border-white/10 bg-white/[0.04]" : "border-foreground/14 bg-card focus-within:ring-primary/25"}`}
      >
        <Search
          className={`size-4 shrink-0 ${dark ? "text-muted-foreground" : "text-muted-foreground"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          defaultValue={initialQuery}
          name="q"
          type="search"
          maxLength={80}
          placeholder={t("placeholder")}
          className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none ${dark ? "text-foreground placeholder:text-muted-foreground" : "text-foreground placeholder:text-muted-foreground"}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${dark ? "text-primary" : "text-primary"}`}
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
