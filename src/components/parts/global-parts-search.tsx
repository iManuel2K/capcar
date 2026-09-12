"use client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

export function GlobalPartsSearch({
  theme = "light",
  expanded = false,
  initialQuery = "",
}: {
  theme?: "light" | "dark";
  expanded?: boolean;
  initialQuery?: string;
}) {
  const dark = theme === "dark";
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
      action="/parts-search"
      role="search"
      onSubmit={() => setPending(true)}
      aria-busy={pending}
      className={expanded ? "w-full" : "w-52 xl:w-64"}
    >
      <label className="sr-only" htmlFor={id}>
        {t("label")}
      </label>
      <div
        className={`flex min-h-11 items-center rounded-full border px-3 transition focus-within:ring-2 ${dark ? "border-white/10 bg-white/[0.04] focus-within:ring-[#e72d45]/40" : "border-[#0e2d30]/14 bg-white/35 focus-within:ring-[#6d0101]/25"}`}
      >
        <Search
          className={`size-4 shrink-0 ${dark ? "text-white/40" : "text-[#0e2d30]/45"}`}
          aria-hidden="true"
        />
        <input
          id={id}
          defaultValue={initialQuery}
          name="q"
          type="search"
          maxLength={80}
          placeholder={t("placeholder")}
          className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none ${dark ? "text-white placeholder:text-white/30" : "text-[#0e2d30] placeholder:text-[#0e2d30]/42"}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${dark ? "text-[#ff667a]" : "text-[#6d0101]"}`}
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
