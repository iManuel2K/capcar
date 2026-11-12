"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  addToBoard,
  boardKey,
  boardSchema,
  observePrice,
  type BoardEntry,
} from "@/features/retail/parts-board";
import {
  savedPhotoItemSchema,
  savedPhotoResponseSchema,
  type RetailItem,
  type RetailRequest,
  type RetailResponse,
} from "@/features/retail/retail-contracts";
import { actionClass } from "@/components/community/community-shell";
import {
  useBrowserValue,
  writeBrowserValue,
  readBrowserValue,
} from "@/features/storage/browser-value";
const KEY = "capcar.parts-board.v1";
function readBoard() {
  return boardSchema.parse(JSON.parse(readBrowserValue(KEY) || "[]"));
}
const Board = createContext<{
  add: (item: RetailItem, input: RetailRequest, at: string) => void;
  observe: (result: RetailResponse, input: RetailRequest) => void;
} | null>(null);
export function PartsBoardProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Expansion");
  const retail = useTranslations("Retail");
  const locale = useLocale();
  const raw = useBrowserValue(KEY);
  const entries = useMemo(() => {
    const parsed = boardSchema.safeParse(
      (() => {
        try {
          return JSON.parse(raw || "[]");
        } catch {
          return null;
        }
      })(),
    );
    return parsed.success ? parsed.data : [];
  }, [raw]);
  const requestedPhotos = useRef(new Set<string>());
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const missing = new Map<string, { itemId: string; market: string }>();
      for (const entry of entries) {
        if (entry.imageUrl || entry.provider === "partner") continue;
        const candidate = savedPhotoItemSchema.safeParse({
          itemId: entry.providerItemId ?? entry.id,
          market: entry.input.market,
        });
        if (!candidate.success) continue;
        const key = `${candidate.data.market}:${candidate.data.itemId}`;
        if (!requestedPhotos.current.has(key)) missing.set(key, candidate.data);
      }
      if (!missing.size) return;
      for (const key of missing.keys()) requestedPhotos.current.add(key);
      void (async () => {
        try {
          const response = await fetch("/api/retail/saved-photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([...missing.values()]),
          });
          if (!response.ok) return;
          const photos = savedPhotoResponseSchema.parse(await response.json());
          if (!photos.length) return;
          const latest = readBoard();
          const next = latest.map((entry) => {
            if (entry.imageUrl || entry.provider === "partner") return entry;
            const photo = photos.find(
              (photo) =>
                photo.itemId === (entry.providerItemId ?? entry.id) &&
                photo.market === entry.input.market,
            );
            return photo ? { ...entry, imageUrl: photo.imageUrl } : entry;
          });
          if (next.some((entry, index) => entry !== latest[index]))
            writeBrowserValue(KEY, JSON.stringify(boardSchema.parse(next)));
        } catch {
          // Keep the original offer when photo enrichment fails.
        }
      })();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [entries]);
  const [message, setMessage] = useState("");
  const write = useCallback(
    (next: BoardEntry[]) => {
      try {
        const checked = boardSchema.parse(next);
        writeBrowserValue(KEY, JSON.stringify(checked));
        setMessage("");
      } catch {
        setMessage(t("storageError"));
      }
    },
    [t],
  );
  const add = useCallback(
    (item: RetailItem, input: RetailRequest, at: string) => {
      try {
        write(addToBoard(readBoard(), item, input, at));
      } catch {
        setMessage(t("boardFull"));
      }
    },
    [t, write],
  );
  const observe = useCallback(
    (result: RetailResponse, input: RetailRequest) => {
      try {
        let changed = false;
        const next = readBoard().map((saved) => {
          const item = result.items.find((item) => item.id === saved.id);
          if (
            !item ||
            saved.input.market !== input.market ||
            saved.input.destination !== input.destination
          )
            return saved;
          const updated = observePrice(saved, item, result.checkedAt);
          if (updated !== saved) changed = true;
          return updated;
        });
        if (changed) write(next);
      } catch {
        setMessage(t("storageError"));
      }
    },
    [write, t],
  );
  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      amount,
    );
  return (
    <Board.Provider value={{ add, observe }}>
      {children}
      <section
        id="parts-board"
        className="border-foreground/25 mt-8 space-y-5 rounded-3xl border bg-white/25 p-5 sm:p-8"
      >
        <h2 className="text-2xl font-medium">{t("board")}</h2>
        <p role="status">{message}</p>
        {!entries.length ? (
          <p>{t("boardEmpty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <article
                key={boardKey(entry)}
                className="border-foreground/15 bg-card flex min-w-0 flex-col overflow-hidden rounded-2xl border"
              >
                <div className="bg-muted relative grid aspect-[4/3] place-items-center">
                  <Package
                    className="text-muted-foreground size-9"
                    aria-hidden="true"
                  />
                  {entry.imageUrl && (
                    <Image
                      key={entry.imageUrl}
                      src={entry.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="bg-muted object-contain"
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="text-muted-foreground text-sm">
                    {entry.retailer ??
                      (entry.provider === "partner"
                        ? retail("retailer")
                        : "eBay")}{" "}
                    · {entry.condition}
                  </p>
                  <h3 className="font-semibold break-words">{entry.title}</h3>
                  <div>
                    <p className="text-xl font-semibold">
                      {money(
                        entry.price + (entry.shipping ?? 0),
                        entry.currency,
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {entry.shipping === null
                        ? `${t("shipping")} · ${t("unknown")}`
                        : retail("total")}
                    </p>
                  </div>
                  {entry.affiliate && (
                    <p className="text-muted-foreground text-xs">
                      {t("affiliate")}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel={
                        entry.affiliate
                          ? "sponsored noopener noreferrer"
                          : "noopener noreferrer"
                      }
                      className={`${actionClass} inline-flex items-center`}
                    >
                      {retail("view")}
                    </a>
                    <button
                      type="button"
                      className="min-h-11 px-3 text-sm underline underline-offset-4"
                      onClick={() =>
                        write(
                          readBoard().filter(
                            (item) => boardKey(item) !== boardKey(entry),
                          ),
                        )
                      }
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Board.Provider>
  );
}
export function BoardButton({
  item,
  input,
  checkedAt,
}: {
  item: RetailItem;
  input: RetailRequest;
  checkedAt: string;
}) {
  const board = useContext(Board);
  const t = useTranslations("Expansion");
  return (
    <button
      className={actionClass}
      onClick={() => board?.add(item, input, checkedAt)}
    >
      {t("compareSave")}
    </button>
  );
}
export function BoardObserver({
  result,
  input,
}: {
  result: RetailResponse;
  input: RetailRequest;
}) {
  const board = useContext(Board);
  const observe = board?.observe;
  useEffect(() => {
    observe?.(result, input);
  }, [result, input, observe]);
  return null;
}
