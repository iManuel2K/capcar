"use client";

import { useState } from "react";
import { GarageAccountBoundary } from "@/components/account/garage-account-boundary";
import { useLocale, useTranslations } from "next-intl";
import Link from "@/components/i18n/public-link";
import {
  PartsBoardProvider,
  BoardButton,
  BoardObserver,
} from "@/components/parts/parts-board";
import { ResilientPartSearch } from "@/components/parts/resilient-part-search";
import {
  type RetailItem,
  type RetailRequest,
} from "@/features/retail/retail-contracts";
import { actionClass } from "./community-shell";
import { RetailSaveDialog } from "./retail-save-dialog";

type SaveSelection = {
  item: RetailItem;
  checkedAt: string;
  searchVehicle?: RetailRequest["vehicle"];
  trigger: HTMLButtonElement;
};

export function RetailSearch({
  initialQuery = "",
  garageSyncConfigured = false,
}: {
  initialQuery?: string;
  garageSyncConfigured?: boolean;
}) {
  const t = useTranslations("Retail");
  const parts = useTranslations("PartsPage");
  const search = useTranslations("PartsSearch");
  const labels = useTranslations("Hardening.Search");
  const locale = useLocale();
  const money = (value: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      value,
    );
  const [selection, setSelection] = useState<SaveSelection | null>(null);
  const [saveOpened, setSaveOpened] = useState(false);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl leading-7">{t("intro")}</p>
      <div className="flex flex-wrap gap-x-5">
        <Link
          href="/parts-search"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          {parts("examples")} →
        </Link>
        <a
          href="#parts-board"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          {t("openComparison")} ↓
        </a>
      </div>
      <PartsBoardProvider>
        <ResilientPartSearch initialQuery={initialQuery} marketplaceLinks>
          {(result, input, navigate, pending) => (
            <>
              {!pending && result.freshness !== "stale" && (
                <BoardObserver result={result} input={input} />
              )}
              <p className="text-sm leading-6">{labels("warning")}</p>
              {!pending && !result.items.length && <p>{t("empty")}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                {result.items.map((item) => (
                  <article
                    key={item.id}
                    className="border-foreground/20 flex min-w-0 flex-col gap-4 rounded-2xl border p-5"
                  >
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm font-medium">
                        {item.retailer ??
                          (item.provider === "partner"
                            ? t("retailer")
                            : "eBay")}
                      </p>
                      <h2 className="text-xl font-medium break-words">
                        {item.title}
                      </h2>
                      <p className="text-sm">
                        {item.condition} · {t("seller")}{" "}
                        {item.country ?? t("notSupplied")}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt>{t("itemPrice")}</dt>
                      <dd className="font-medium">
                        {money(item.price, item.currency)}
                      </dd>
                      <dt>{labels("shipping")}</dt>
                      <dd>
                        {item.shipping === null
                          ? t("notSupplied")
                          : money(item.shipping, item.currency)}
                      </dd>
                      {item.shipping !== null && (
                        <>
                          <dt>{t("total")}</dt>
                          <dd className="font-semibold">
                            {money(item.price + item.shipping, item.currency)}
                          </dd>
                        </>
                      )}
                    </dl>
                    <p className="text-muted-foreground mt-auto text-sm">
                      {item.affiliate ? t("affiliate") : t("direct")}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                      <BoardButton
                        item={item}
                        input={input}
                        checkedAt={result.checkedAt}
                      />
                      <button
                        type="button"
                        className={actionClass}
                        onClick={(event) => {
                          setSaveOpened(true);
                          setSelection({
                            item,
                            checkedAt: result.checkedAt,
                            searchVehicle: input.vehicle,
                            trigger: event.currentTarget,
                          });
                        }}
                      >
                        {t("save")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!pending &&
                (input.page > 0 || (result.hasMore && input.page < 9)) && (
                  <nav aria-label={search("pages")} className="flex gap-3">
                    {input.page > 0 && (
                      <button
                        type="button"
                        className={actionClass}
                        onClick={() =>
                          navigate({ ...input, page: input.page - 1 })
                        }
                      >
                        {t("previous")}
                      </button>
                    )}
                    {result.hasMore && input.page < 9 && (
                      <button
                        type="button"
                        className={actionClass}
                        onClick={() =>
                          navigate({ ...input, page: input.page + 1 })
                        }
                      >
                        {t("next")}
                      </button>
                    )}
                  </nav>
                )}
            </>
          )}
        </ResilientPartSearch>
      </PartsBoardProvider>
      {saveOpened && (
        <GarageAccountBoundary configured={garageSyncConfigured} allowGuest>
          {selection && (
            <RetailSaveDialog
              key={selection.item.id}
              item={selection.item}
              checkedAt={selection.checkedAt}
              searchVehicle={selection.searchVehicle}
              onClose={() => {
                setSelection(null);
                requestAnimationFrame(() => selection.trigger.focus());
              }}
            />
          )}
        </GarageAccountBoundary>
      )}
    </div>
  );
}
