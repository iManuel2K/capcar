"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { actionClass, fieldClass } from "./community-shell";
export type PublicSpecialist = {
  id: string;
  business_name: string;
  city: string;
  website: string;
  summary: string;
  services: string;
  service_area: string;
};
export function PublicSpecialists({
  specialists,
  unavailable,
}: {
  specialists: PublicSpecialist[];
  unavailable: boolean;
}) {
  const t = useTranslations("Expansion");
  const [query, setQuery] = useState("");
  const visible = specialists.filter((item) =>
    `${item.business_name} ${item.city} ${item.services} ${item.service_area}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">{t("specialistsNote")}</p>
      <label className="block max-w-2xl">
        {t("searchSpecialists")}
        <input
          type="search"
          maxLength={100}
          className={fieldClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {unavailable ? (
        <p role="alert">{t("error")}</p>
      ) : !visible.length ? (
        <p role="status">{t("noSpecialists")}</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((shop) => (
            <article
              key={shop.id}
              className="space-y-4 rounded-2xl border border-current/20 bg-white/25 p-6"
            >
              <p className="text-xs uppercase">{t("approvedSpecialist")}</p>
              <h2 className="text-2xl font-medium">{shop.business_name}</h2>
              <p>
                {shop.city} · {shop.service_area}
              </p>
              <p className="text-sm leading-6">{shop.summary}</p>
              <p className="text-sm">{shop.services}</p>
              <div className="flex flex-wrap gap-3">
                {safeWebsite(shop.website) && (
                  <a
                    className={`${actionClass} inline-flex items-center`}
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("contactShop")}
                  </a>
                )}
                <Link
                  className={`${actionClass} inline-flex items-center`}
                  href={`/verified-work?specialist=${shop.id}`}
                >
                  {t("requestRecord")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <Link
        className="inline-flex min-h-11 items-center underline"
        href="/specialists/apply"
      >
        {t("listBusiness")} →
      </Link>
    </div>
  );
}
function safeWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
