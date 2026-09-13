"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  retailRequestSchema,
  type RetailRequest,
  type RetailResponse,
} from "@/features/retail/retail-contracts";
import { requestRetail, SearchFailure } from "@/features/retail/search-client";
import { ebaySearchUrl } from "@/features/retail/retail-contracts";

type ResultState = {
  key: string;
  data?: RetailResponse;
  error?: SearchFailure;
};
type Props = {
  initialQuery?: string;
  children?: (
    result: RetailResponse,
    input: RetailRequest,
    navigate: (input: RetailRequest) => void,
  ) => ReactNode;
};
const field =
  "mt-2 min-h-12 w-full rounded-xl border border-[#0e2d30]/25 bg-white/50 px-3 text-[#0e2d30] outline-none focus-visible:ring-2 focus-visible:ring-[#6d0101]";
const action =
  "min-h-11 rounded-xl border border-[#0e2d30]/30 px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50";
function optionalPrice(value: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return parsed;
}

export function ResilientPartSearch({ children, initialQuery = "" }: Props) {
  const t = useTranslations("PartsSearch");
  const errors = useTranslations("Hardening.Search");
  const locale = useLocale();
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const money = (value: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      value,
    );
  const id = useId();
  const [input, setInput] = useState<RetailRequest>({
    query: initialQuery.trim().slice(0, 80),
    market: "DE",
    destination: "DE",
    condition: "all",
    sort: "bestMatch",
    page: 0,
  });
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ResultState>({ key: "" });
  const [submitted, setSubmitted] = useState(false);
  const [composing, setComposing] = useState(false);
  const active = useRef<AbortController | null>(null);
  const cache = useRef(new Map<string, { at: number; data: RetailResponse }>());
  const parsed = retailRequestSchema.safeParse(input);
  const valid = parsed.success;
  const priceRangeInvalid =
    input.minPrice !== undefined &&
    input.maxPrice !== undefined &&
    input.minPrice > input.maxPrice;
  const filtersActive =
    input.condition !== "all" ||
    input.sort !== "bestMatch" ||
    input.minPrice !== undefined ||
    input.maxPrice !== undefined;
  const requestKey = JSON.stringify({ ...input, query: input.query.trim() });
  const key = `${requestKey}:${attempt}`;
  const current = state.key === key ? state : undefined;
  const pending = valid && !composing && !current;

  function change(next: RetailRequest) {
    if (JSON.stringify({ ...next, query: next.query.trim() }) !== requestKey)
      active.current?.abort();
    setSubmitted(false);
    setInput(next);
  }
  useEffect(() => {
    if (!valid || composing) return;
    const controller = new AbortController();
    active.current = controller;
    let timedOut = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(async () => {
      const cached = cache.current.get(requestKey);
      if (cached && Date.now() - cached.at < 30_000) {
        setState({ key, data: cached.data });
        return;
      }
      timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 25_000);
      try {
        const data = await requestRetail(
          JSON.parse(requestKey) as RetailRequest,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        if (cache.current.size >= 10) cache.current.clear();
        cache.current.set(requestKey, { at: Date.now(), data });
        setState({ key, data });
      } catch (error) {
        if (controller.signal.aborted && !timedOut) return;
        setState({
          key,
          error: timedOut
            ? new SearchFailure(t("timeout"), true, "timeout")
            : error instanceof SearchFailure
              ? error
              : new SearchFailure(t("connection")),
        });
      } finally {
        clearTimeout(timeout);
      }
    }, 500);
    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [key, requestKey, valid, composing, t]);

  function retry() {
    cache.current.delete(requestKey);
    setAttempt((value) => value + 1);
  }
  return (
    <div className="space-y-5 text-[#0e2d30]">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (
            valid &&
            !pending &&
            !composing &&
            current?.error?.retryable !== false
          )
            retry();
        }}
        className="grid gap-4 rounded-2xl border border-[#0e2d30]/20 bg-white/25 p-5 sm:grid-cols-2"
      >
        <label htmlFor={id} className="sm:col-span-2">
          {t("query")}
          <input
            id={id}
            type="search"
            name="query"
            value={input.query}
            maxLength={100}
            aria-describedby={`${id}-hint`}
            aria-invalid={submitted && input.query.trim().length < 3}
            onCompositionStart={() => {
              active.current?.abort();
              setComposing(true);
            }}
            onCompositionEnd={() => setComposing(false)}
            onChange={(event) =>
              change({ ...input, query: event.target.value, page: 0 })
            }
            className={field}
          />
        </label>
        <p id={`${id}-hint`} className="text-sm sm:col-span-2">
          {submitted && !valid ? t("invalidQuery") : t("queryHint")}
        </p>
        <label>
          {t("market")}
          <select
            value={input.market}
            onChange={(event) =>
              change({
                ...input,
                market: event.target.value as RetailRequest["market"],
                page: 0,
              })
            }
            className={field}
          >
            {["DE", "GB", "FR", "IT", "ES", "US"].map((code) => (
              <option key={code} value={code}>
                {regions.of(code) ?? code}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("destination")}
          <select
            value={input.destination}
            onChange={(event) =>
              change({
                ...input,
                destination: event.target.value as RetailRequest["destination"],
                page: 0,
              })
            }
            className={field}
          >
            {["DE", "AT", "FR", "IT", "ES", "NL", "BE", "GB", "US"].map(
              (code) => (
                <option key={code} value={code}>
                  {regions.of(code) ?? code}
                </option>
              ),
            )}
          </select>
        </label>
        <fieldset className="grid gap-4 border-t border-[#0e2d30]/15 pt-4 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
          <legend className="px-1 text-sm font-medium tracking-[0.08em] uppercase">
            {t("refine")}
          </legend>
          <label>
            {t("condition")}
            <select
              value={input.condition}
              onChange={(event) =>
                change({
                  ...input,
                  condition: event.target.value as RetailRequest["condition"],
                  page: 0,
                })
              }
              className={field}
            >
              <option value="all">{t("anyCondition")}</option>
              <option value="new">{t("new")}</option>
              <option value="used">{t("used")}</option>
              <option value="parts">{t("forParts")}</option>
            </select>
          </label>
          <label>
            {t("order")}
            <select
              value={input.sort}
              onChange={(event) =>
                change({
                  ...input,
                  sort: event.target.value as RetailRequest["sort"],
                  page: 0,
                })
              }
              className={field}
            >
              <option value="bestMatch">{t("bestMatch")}</option>
              <option value="priceAsc">{t("lowestPrice")}</option>
              <option value="priceDesc">{t("highestPrice")}</option>
              <option value="newest">{t("newest")}</option>
            </select>
          </label>
          <label>
            {t("minimum")}
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="1000000"
              step="0.01"
              value={input.minPrice ?? ""}
              aria-invalid={priceRangeInvalid}
              aria-describedby={
                priceRangeInvalid ? `${id}-price-error` : undefined
              }
              onChange={(event) =>
                change({
                  ...input,
                  minPrice: optionalPrice(event.target.value),
                  page: 0,
                })
              }
              className={field}
              placeholder={t("noMinimum")}
            />
          </label>
          <label>
            {t("maximum")}
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="1000000"
              step="0.01"
              value={input.maxPrice ?? ""}
              aria-invalid={priceRangeInvalid}
              aria-describedby={
                priceRangeInvalid ? `${id}-price-error` : undefined
              }
              onChange={(event) =>
                change({
                  ...input,
                  maxPrice: optionalPrice(event.target.value),
                  page: 0,
                })
              }
              className={field}
              placeholder={t("noMaximum")}
            />
          </label>
          {priceRangeInvalid && (
            <p
              role="alert"
              id={`${id}-price-error`}
              className="text-sm text-[#6d0101] sm:col-span-2 lg:col-span-3"
            >
              {t("invalidRange")}
            </p>
          )}
          {filtersActive && (
            <button
              type="button"
              className={`${action} justify-self-start`}
              onClick={() =>
                change({
                  ...input,
                  condition: "all",
                  sort: "bestMatch",
                  minPrice: undefined,
                  maxPrice: undefined,
                  page: 0,
                })
              }
            >
              {t("clear")}
            </button>
          )}
        </fieldset>
        <button
          className={`${action} sm:col-span-2`}
          disabled={pending || composing || current?.error?.retryable === false}
        >
          {pending ? t("searching") : t("search")}
        </button>
      </form>
      <p role="status" aria-live="polite" className="text-sm">
        {pending
          ? t("searchStatus")
          : current?.data
            ? t("found", { count: current.data.items.length })
            : ""}
      </p>
      {pending && (
        <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 rounded-2xl bg-[#0e2d30]/10 motion-safe:animate-pulse"
            />
          ))}
        </div>
      )}
      {current?.error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#6d0101]/30 bg-white/35 p-5"
        >
          <p>{errors(current.error.code)}</p>
          {current.error.retryable && (
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={retry} className={action}>
                {t("retry")}
              </button>
              <a
                href={ebaySearchUrl(input)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${action} inline-flex items-center`}
              >
                {t("continueEbay")}
              </a>
            </div>
          )}
        </div>
      )}
      {current?.data &&
        (children ? (
          children(current.data, input, (next) => setInput(next))
        ) : (
          <>
            <p className="text-sm leading-6">{errors("warning")}</p>
            <p className="text-sm leading-6">{errors("original")}</p>
            {!current.data.items.length && (
              <p className="rounded-2xl border border-dashed border-[#0e2d30]/30 p-6">
                {t("empty")}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {current.data.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#0e2d30]/20 bg-white/30 p-5"
                >
                  <h2 className="text-xl font-medium break-words">
                    {item.title}
                  </h2>
                  <p className="mt-3">
                    {money(item.price, item.currency)} · {t("shipping")}{" "}
                    {item.shipping === null
                      ? t("notConfirmed")
                      : money(item.shipping, item.currency)}
                  </p>
                  <p className="mt-2 text-sm">
                    {item.affiliate ? t("affiliate") : t("direct")}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel={
                      item.affiliate
                        ? "sponsored noopener noreferrer"
                        : "noopener noreferrer"
                    }
                    className={`${action} mt-4 inline-flex items-center`}
                  >
                    {t("view")}
                  </a>
                </article>
              ))}
            </div>
            <nav aria-label={t("pages")} className="flex gap-3">
              {input.page > 0 && (
                <button
                  className={action}
                  onClick={() => change({ ...input, page: input.page - 1 })}
                >
                  {t("previous")}
                </button>
              )}
              {current.data.hasMore && input.page < 9 && (
                <button
                  className={action}
                  onClick={() => change({ ...input, page: input.page + 1 })}
                >
                  {t("next")}
                </button>
              )}
            </nav>
          </>
        ))}
    </div>
  );
}
