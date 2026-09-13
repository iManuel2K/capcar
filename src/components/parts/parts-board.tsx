"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  addToBoard,
  boardKey,
  boardSchema,
  observePrice,
  type BoardEntry,
} from "@/features/retail/parts-board";
import {
  type RetailItem,
  type RetailRequest,
  type RetailResponse,
} from "@/features/retail/retail-contracts";
import {
  actionClass,
  fieldClass,
} from "@/components/community/community-shell";
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
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const write = useCallback(
    (next: BoardEntry[]) => {
      try {
        const checked = boardSchema.parse(next);
        writeBrowserValue(KEY, JSON.stringify(checked));
        setConfirmed(false);
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
        className="mt-8 space-y-5 rounded-3xl border border-[#0e2d30]/25 bg-white/25 p-5 sm:p-8"
      >
        <h2 className="text-2xl font-medium">{t("board")}</h2>
        <p className="max-w-3xl text-sm leading-6">{t("boardNote")}</p>
        <p role="status">{message}</p>
        {!entries.length ? (
          <p>{t("boardEmpty")}</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entries.map((entry) => (
                <article
                  key={boardKey(entry)}
                  className="min-w-0 space-y-3 rounded-2xl border border-current/20 p-4"
                >
                  <h3 className="font-semibold break-words">{entry.title}</h3>
                  <p>
                    {money(entry.price, entry.currency)} · {entry.input.market}{" "}
                    → {entry.input.destination}
                  </p>
                  <p className="text-sm">
                    {t("shipping")}:{" "}
                    {entry.shipping === null
                      ? t("unknown")
                      : money(entry.shipping, entry.currency)}
                  </p>
                  <p className="text-xs">
                    {new Date(entry.checkedAt).toLocaleString(locale)}
                  </p>
                  <label className="block text-sm">
                    {t("target")} ({entry.currency})
                    <input
                      type="number"
                      min="0.01"
                      max="1000000"
                      step="0.01"
                      className={fieldClass}
                      value={entry.target ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value &&
                          (!Number.isFinite(Number(value)) ||
                            Number(value) <= 0 ||
                            Number(value) > 1e6)
                        )
                          return;
                        write(
                          readBoard().map((item) =>
                            boardKey(item) === boardKey(entry)
                              ? {
                                  ...item,
                                  target: value ? Number(value) : null,
                                }
                              : item,
                          ),
                        );
                      }}
                    />
                  </label>
                  {entry.target !== null && entry.price <= entry.target && (
                    <p
                      role="status"
                      className="rounded-xl bg-[#0e2d30] p-3 text-sm text-[#e8e6d7]"
                    >
                      {t("targetReached")}
                    </p>
                  )}
                  <details>
                    <summary className="min-h-11 cursor-pointer py-2 text-sm">
                      {t("history")}
                    </summary>
                    <ol className="space-y-2 text-xs">
                      {entry.history.map((sample) => (
                        <li key={sample.at}>
                          {new Date(sample.at).toLocaleString(locale)} ·{" "}
                          {money(sample.price, entry.currency)}
                        </li>
                      ))}
                    </ol>
                  </details>
                  <button
                    className={actionClass}
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
                </article>
              ))}
            </div>
            <button
              className={`${actionClass} bg-[#0e2d30] text-[#e8e6d7]`}
              onClick={() => {
                setReview((value) => !value);
                setConfirmed(false);
              }}
            >
              {t("reviewPurchase")}
            </button>
            {review && (
              <div className="space-y-4 rounded-2xl border border-current/20 p-5">
                <h3 className="text-xl font-medium">{t("handoff")}</h3>
                <p className="max-w-3xl text-sm leading-6">
                  {t("handoffNote")}
                </p>
                {[...new Set(entries.map((item) => item.currency))].map(
                  (currency) => {
                    const group = entries.filter(
                      (item) => item.currency === currency,
                    );
                    const subtotal =
                      group.reduce(
                        (sum, item) => sum + Math.round(item.price * 100),
                        0,
                      ) / 100;
                    const shipping = group.some(
                      (item) => item.shipping === null,
                    )
                      ? null
                      : group.reduce(
                          (sum, item) => sum + Math.round(item.shipping! * 100),
                          0,
                        ) / 100;
                    return (
                      <p key={currency}>
                        {t("itemsSubtotal")}:{" "}
                        <strong>{money(subtotal, currency)}</strong> ·{" "}
                        {t("shipping")}:{" "}
                        {shipping === null
                          ? t("unknown")
                          : money(shipping, currency)}
                      </p>
                    );
                  },
                )}
                <label className="flex items-start gap-3 text-sm leading-6">
                  <input
                    type="checkbox"
                    className="mt-1 size-5 shrink-0"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  {t("confirmMerchant")}
                </label>
                {confirmed && (
                  <ul className="space-y-3">
                    {entries.map((entry) => (
                      <li key={boardKey(entry)}>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel={
                            entry.affiliate
                              ? "sponsored noopener noreferrer"
                              : "noopener noreferrer"
                          }
                          className="inline-flex min-h-11 items-center underline"
                        >
                          {t("continueEbay")} · {entry.title}
                        </a>
                        <p className="text-xs">
                          {entry.affiliate ? t("affiliate") : t("direct")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
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
