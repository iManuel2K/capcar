"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  isAppLocale,
  localeCookie,
  localeLabels,
  locales,
} from "@/i18n/config";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("Language");
  const [pending, setPending] = useState(false);

  return (
    <label className="relative inline-flex min-h-11 items-center text-sm">
      <span className="sr-only">{t("label")}</span>
      <Languages
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4"
      />
      <select
        aria-label={t("label")}
        value={locale}
        disabled={pending}
        onChange={(event) => {
          if (!isAppLocale(event.target.value)) return;
          setPending(true);
          document.cookie = `${localeCookie}=${event.target.value}; Path=/; Max-Age=31536000; SameSite=Lax`;
          document.documentElement.lang = event.target.value;
          window.location.reload();
        }}
        className={`min-h-11 appearance-none rounded-full border border-current/20 bg-transparent py-2 pr-8 pl-9 font-medium transition outline-none hover:bg-current/5 focus-visible:ring-2 focus-visible:ring-[#6d0101] disabled:opacity-55 ${compact ? "max-w-32" : "w-full"}`}
      >
        {locales.map((option) => (
          <option key={option} value={option} className="text-[#0e2d30]">
            {localeLabels[option]}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-[0.65rem]"
      >
        ▾
      </span>
    </label>
  );
}
