"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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

export function ResilientPartSearch({ children }: Props) {
  const id = useId();
  const [input, setInput] = useState<RetailRequest>({
    query: "",
    market: "DE",
    destination: "DE",
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
            ? new SearchFailure(
                "The retailer took too long. Your search is saved here—try again.",
              )
            : error instanceof SearchFailure
              ? error
              : new SearchFailure(
                  "Connection interrupted. Check your connection and try again.",
                ),
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
  }, [key, requestKey, valid, composing]);

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
          Part number or search phrase
          <input
            id={id}
            type="search"
            name="query"
            value={input.query}
            maxLength={100}
            aria-describedby={`${id}-hint`}
            aria-invalid={submitted && !valid}
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
          {submitted && !valid
            ? "Enter at least 3 characters, such as E90 rear lights."
            : "Search by part number, chassis or description. No account required."}
        </p>
        <label>
          Retailer market
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
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
        <label>
          Deliver to
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
                <option key={code}>{code}</option>
              ),
            )}
          </select>
        </label>
        <button
          className={action}
          disabled={pending || composing || current?.error?.retryable === false}
        >
          {pending ? "Searching…" : "Search live listings"}
        </button>
      </form>
      <p role="status" aria-live="polite" className="text-sm">
        {pending
          ? "Searching live retailer listings…"
          : current?.data
            ? `${current.data.items.length} listings found.`
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
          <p>{current.error.message}</p>
          {current.error.retryable && (
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={retry} className={action}>
                Try again
              </button>
              <a
                href={ebaySearchUrl(input)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${action} inline-flex items-center`}
              >
                Continue this search on eBay ↗
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
            <p className="text-sm leading-6">{current.data.warning}</p>
            {!current.data.items.length && (
              <p className="rounded-2xl border border-dashed border-[#0e2d30]/30 p-6">
                No listings for this search. Try the OE number, a shorter phrase
                or another market.
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
                    {item.price.toFixed(2)} {item.currency} · shipping{" "}
                    {item.shipping === null
                      ? "not confirmed"
                      : `${item.shipping.toFixed(2)} ${item.currency}`}
                  </p>
                  <p className="mt-2 text-sm">
                    {item.affiliate
                      ? "Affiliate link: CapCar may earn a commission."
                      : "Direct retailer link."}
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
                    View at eBay ↗
                  </a>
                </article>
              ))}
            </div>
            <nav aria-label="Search results pages" className="flex gap-3">
              {input.page > 0 && (
                <button
                  className={action}
                  onClick={() => change({ ...input, page: input.page - 1 })}
                >
                  Previous
                </button>
              )}
              {current.data.hasMore && input.page < 9 && (
                <button
                  className={action}
                  onClick={() => change({ ...input, page: input.page + 1 })}
                >
                  Next
                </button>
              )}
            </nav>
          </>
        ))}
    </div>
  );
}
