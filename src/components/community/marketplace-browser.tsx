"use client";
import Link from "next/link";
import Image from "next/image";
import {
  useBrowserValue,
  writeBrowserValue,
} from "@/features/storage/browser-value";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { actionClass, fieldClass } from "./community-shell";
export type PublicListing = {
  id: string;
  title: string;
  description: string;
  city: string;
  price_cents: number;
  condition: string;
};
export function ListingBookmark({ id }: { id: string }) {
  const t = useTranslations("Expansion");
  const saved = useBrowserValue(`capcar.listing.${id}`) === "1";
  const [error, setError] = useState(false);
  return (
    <>
      <button
        aria-pressed={saved}
        className={actionClass}
        onClick={() => {
          try {
            writeBrowserValue(`capcar.listing.${id}`, saved ? "0" : "1");
            setError(false);
            window.dispatchEvent(new Event("capcar-bookmarks"));
          } catch {
            setError(true);
          }
        }}
      >
        {saved ? t("savedListing") : t("saveListing")}
      </button>
      {error && <p role="alert">{t("storageError")}</p>}
    </>
  );
}
export function MarketplaceBrowser({
  listings,
}: {
  listings: PublicListing[];
}) {
  const t = useTranslations("Expansion");
  const publicText = useTranslations("CommunityPublic");
  const trust = useTranslations("Hardening.Trust");
  const locale = useLocale();
  const [limit, setLimit] = useState(12);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("newest");
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      try {
        setSavedIds(
          listings
            .filter(
              (item) =>
                localStorage.getItem(`capcar.listing.${item.id}`) === "1",
            )
            .map((item) => item.id),
        );
      } catch {
        /* Empty bookmarks when storage is blocked. */
      }
    };
    refresh();
    window.addEventListener("capcar-bookmarks", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("capcar-bookmarks", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [listings]);
  const visible = listings
    .filter(
      (item) =>
        `${item.title} ${item.description}`
          .toLocaleLowerCase(locale)
          .includes(query.trim().toLocaleLowerCase(locale)) &&
        item.city
          .toLocaleLowerCase(locale)
          .includes(city.trim().toLocaleLowerCase(locale)) &&
        (condition === "all" || condition === item.condition) &&
        (!savedOnly || savedIds.includes(item.id)),
    )
    .sort((a, b) =>
      sort === "priceAsc"
        ? a.price_cents - b.price_cents
        : sort === "priceDesc"
          ? b.price_cents - a.price_cents
          : 0,
    );
  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-2xl border border-current/20 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          {t("searchListings")}
          <input
            type="search"
            className={fieldClass}
            maxLength={100}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          {t("city")}
          <input
            className={fieldClass}
            maxLength={100}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <label>
          {t("condition")}
          <select
            className={fieldClass}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="all">{t("all")}</option>
            {["new", "used", "for-parts"].map((value) => (
              <option key={value} value={value}>
                {trust(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("sort")}
          <select
            className={fieldClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {["newest", "priceAsc", "priceDesc"].map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            className="size-5"
            checked={savedOnly}
            onChange={(e) => setSavedOnly(e.target.checked)}
          />
          {t("savedOnly")}
        </label>
      </div>
      <p role="status">{t("listingCount", { count: visible.length })}</p>
      {visible.length > limit && (
        <button
          className={actionClass}
          onClick={() => setLimit((value) => value + 12)}
        >
          {t("moreListings")}
        </button>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {visible.slice(0, limit).map((item) => (
          <article
            key={item.id}
            className="min-w-0 space-y-4 rounded-2xl border border-current/20 bg-white/25 p-5"
          >
            <p className="text-xs uppercase">
              {trust(item.condition)} · {item.city}
            </p>
            <ListingPhoto listingId={item.id} title={item.title} />
            <h2 className="text-2xl font-medium">{item.title}</h2>
            <p className="text-sm leading-6 break-words whitespace-pre-wrap">
              {item.description}
            </p>
            <p className="font-semibold">
              {new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "EUR",
              }).format(item.price_cents / 100)}
            </p>
            <div className="flex flex-wrap gap-3">
              <ListingBookmark id={item.id} />
              <Link
                className={`${actionClass} inline-flex items-center`}
                href={`/login?next=${encodeURIComponent(`/marketplace?listing=${item.id}`)}`}
              >
                {publicText("contact")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
export function ListingPhoto({
  listingId,
  title,
  owner = false,
  onUploaded,
}: {
  listingId: string;
  title: string;
  owner?: boolean;
  onUploaded?: () => void;
}) {
  const t = useTranslations("Expansion");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/community/photo?id=${listingId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (response.ok) {
          const result = await response.json();
          if (typeof result.url === "string" && !controller.signal.aborted)
            setUrl(result.url);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [listingId]);
  return (
    <div>
      {url && (
        /* Signed media URL, intentionally unoptimized and short-lived. */ <Image
          unoptimized
          width={1280}
          height={960}
          src={url}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="mb-3 aspect-[4/3] w-full rounded-xl object-cover"
          onError={() => {
            setUrl("");
            setError(t("photoError"));
          }}
        />
      )}
      {owner && (
        <label
          className={`${actionClass} inline-flex cursor-pointer items-center`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError("");
              try {
                if (file.size > 8 * 1024 * 1024) throw new Error("size");
                const bitmap = await createImageBitmap(file);
                if (bitmap.width * bitmap.height > 40000000) {
                  bitmap.close();
                  throw new Error("size");
                }
                const canvas = document.createElement("canvas");
                const scale = Math.min(
                  1,
                  1280 / Math.max(bitmap.width, bitmap.height),
                );
                canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                canvas.height = Math.max(1, Math.round(bitmap.height * scale));
                const context = canvas.getContext("2d");
                if (!context) throw new Error("image");
                context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                bitmap.close();
                const blob = await new Promise<Blob>((resolve, reject) =>
                  canvas.toBlob(
                    (value) =>
                      value ? resolve(value) : reject(new Error("image")),
                    "image/jpeg",
                    0.8,
                  ),
                );
                const form = new FormData();
                form.append("file", blob, "listing.jpg");
                form.append("id", listingId);
                const response = await fetch("/api/community/photo", {
                  method: "POST",
                  body: form,
                  signal: AbortSignal.timeout(20000),
                });
                if (!response.ok) throw new Error("upload");
                const result = await response.json();
                setUrl(result.url);
                setError(t("photoReview"));
                onUploaded?.();
              } catch {
                setError(t("photoError"));
              } finally {
                setBusy(false);
              }
            }}
          />
          {busy ? t("loading") : t("uploadPhoto")}
        </label>
      )}
      <p role="status" className="text-sm">
        {error}
      </p>
    </div>
  );
}
