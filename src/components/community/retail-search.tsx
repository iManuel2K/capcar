"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { actionClass, fieldClass } from "./community-shell";
import Link from "next/link";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { saveRetailItem } from "@/features/retail/save-retail-item";
import { announceWishlistChange } from "@/features/wishlist/wishlist-storage";
import { ResilientPartSearch } from "@/components/parts/resilient-part-search";
export function RetailSearch() {
  const t = useTranslations("Retail");
  const locale = useLocale();
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">{t("intro")}</p>
      <ResilientPartSearch>
        {(result, input, search) => (
          <>
            <section className="rounded-2xl border border-[#0e2d30]/20 p-5">
              <label className="block">
                {t("saveOptional")}
                <select
                  className={fieldClass}
                  value={vehicleId}
                  onChange={(event) => {
                    setVehicleId(event.target.value);
                    setSavedMessage("");
                  }}
                >
                  <option value="">{t("chooseVehicle")}</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ·{" "}
                      {vehicle.nickname || vehicle.productionYear}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-3 text-sm">{t("savingNote")}</p>
              {vehicleId && (
                <Link
                  className="inline-flex min-h-11 items-center underline"
                  href={`/garage/${vehicleId}/wishlist`}
                >
                  {t("manage")} →
                </Link>
              )}
              <p role="status">{savedMessage}</p>
            </section>
            {result && (
              <>
                <p role="status">
                  {t("results", {
                    count: result.items.length,
                    time: new Date(result.checkedAt).toLocaleString(locale),
                  })}
                </p>
                <p className="text-sm leading-6">{result.warning}</p>
                {!result.items.length && <p>{t("empty")}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.items.map((item) => (
                    <article
                      key={item.id}
                      className="space-y-4 rounded-2xl border border-[#0e2d30]/20 p-5"
                    >
                      <h2 className="text-xl font-medium break-words">
                        {item.title}
                      </h2>
                      <p>
                        {item.price.toFixed(2)} {item.currency} · shipping{" "}
                        {item.shipping === null
                          ? t("notSupplied")
                          : `${item.shipping.toFixed(2)} ${item.currency}`}
                      </p>
                      <p className="text-sm">
                        {item.condition} · {t("seller")}{" "}
                        {item.country ?? t("notSupplied")}
                      </p>
                      <p className="text-sm">
                        {item.affiliate ? t("affiliate") : t("direct")}
                      </p>
                      <a
                        className={`${actionClass} inline-flex items-center`}
                        href={item.url}
                        target="_blank"
                        rel={
                          item.affiliate
                            ? "sponsored noopener noreferrer"
                            : "noopener noreferrer"
                        }
                      >
                        {t("view")}
                      </a>
                      <button
                        type="button"
                        className={actionClass}
                        disabled={
                          !vehicles.some((vehicle) => vehicle.id === vehicleId)
                        }
                        onClick={() => {
                          try {
                            saveRetailItem(
                              item,
                              vehicleId,
                              result.checkedAt,
                              localStorage,
                            );
                            announceWishlistChange();
                            setSavedMessage(t("saved"));
                          } catch {
                            setSavedMessage(t("saveError"));
                          }
                        }}
                      >
                        {t("save")}
                      </button>
                    </article>
                  ))}
                </div>
                <div className="flex gap-3">
                  {input && input.page > 0 && (
                    <button
                      className={actionClass}

                      onClick={() =>
                        void search({ ...input, page: input.page - 1 })
                      }
                    >
                      {t("previous")}
                    </button>
                  )}
                  {input && result.hasMore && input.page < 9 && (
                    <button
                      className={actionClass}

                      onClick={() =>
                        void search({ ...input, page: input.page + 1 })
                      }
                    >
                      {t("next")}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </ResilientPartSearch>
    </div>
  );
}
