"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowUpRight, RefreshCw, ShieldCheck } from "lucide-react";
import type { Vehicle } from "@/features/vehicles/vehicle-schema";
import type { AppLocale } from "@/i18n/config";
import {
  findProblemProfile,
  problemSourceMappings,
} from "@/features/problems/source-profiles";
import {
  officialProblemResultSchema,
  type OfficialProblemResult,
} from "@/features/problems/official-records-schema";
import { problemSourceCopy } from "@/features/problems/problem-source-copy";
import { garageCarCatalog } from "@/features/vehicles/garage-car-catalog";

const cache = new Map<
  string,
  { expires: number; result: OfficialProblemResult }
>();
const link =
  "inline-flex min-h-11 items-center gap-2 rounded-lg py-2 text-sm text-[#ecc3a7] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";
export function OfficialProblemRecords({ vehicle }: { vehicle: Vehicle }) {
  const locale = useLocale() as AppLocale;
  const c = problemSourceCopy[locale] ?? problemSourceCopy.en;
  const profile = findProblemProfile(vehicle);
  const id = profile?.id;
  const [year, setYear] = useState(vehicle.productionYear);
  const key = `${id}:${year}`;
  const [state, setState] = useState<{
    key: string;
    result?: OfficialProblemResult;
    error?: boolean;
    readAt?: number;
  }>();
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const stored = cache.get(key);
    const request =
      stored && stored.expires > Date.now()
        ? Promise.resolve(stored.result)
        : fetch(
            `/api/problems?${new URLSearchParams({ profile: id, year: String(year) })}`,
            { credentials: "omit", signal: controller.signal },
          ).then(async (response) => {
            if (!response.ok) throw new Error("Source unavailable");
            const result = officialProblemResultSchema.parse(
              await response.json(),
            );
            if (result.profile !== id || result.year !== year)
              throw new Error("Mismatched source response");
            if (cache.size >= 64) cache.delete(cache.keys().next().value!);
            cache.set(key, { result, expires: Date.now() + 300_000 });
            return result;
          });
    void request
      .then((result) => {
        if (!controller.signal.aborted)
          setState({ key, result, readAt: Date.now() });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, error: true });
      });
    return () => controller.abort();
  }, [id, year, key, retry]);
  const result = state?.key === key ? state.result : undefined;
  const error = state?.key === key && state.error;
  const stale =
    result?.fetchedAt &&
    (state?.readAt ?? 0) - Date.parse(result.fetchedAt) > 6 * 60 * 60 * 1000;
  const records = result?.records ?? [];
  return (
    <section
      aria-labelledby="official-problem-title"
      className="mt-6 scroll-mt-24 rounded-3xl border border-[#668178] bg-[#102e30] p-5 text-[#f2f0e3] sm:p-8"
    >
      <div className="flex items-center gap-3">
        <ShieldCheck aria-hidden="true" className="size-5 text-[#d6aa92]" />
        <h2
          id="official-problem-title"
          className="text-2xl font-medium tracking-tight"
        >
          {c.title}
        </h2>
      </div>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-[#c4d3ca]">
        {c.intro}
      </p>
      {profile && (
        <div className="mt-5 max-w-2xl">
          <label className="text-sm font-medium" htmlFor="recall-model-year">
            {c.modelYear}
          </label>
          <select
            id="recall-model-year"
            className="mt-2 block min-h-11 rounded-xl border border-white/30 bg-[#0b2326] px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6aa92]"
            value={year}
            onChange={(event) => {
              setYear(Number(event.target.value));
              setExpanded(false);
            }}
          >
            {Array.from(
              { length: profile.years[1] - profile.years[0] + 1 },
              (_, index) => profile.years[0] + index,
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-6 text-[#c4d3ca]">{c.yearHint}</p>
        </div>
      )}
      {!id && <p className="mt-5 text-sm leading-7">{c.unknown}</p>}
      {id && !result && !error && (
        <p role="status" className="mt-5 flex items-center gap-2 text-sm">
          <RefreshCw
            aria-hidden="true"
            className="size-4 motion-safe:animate-spin"
          />
          {c.loading}
        </p>
      )}
      {error && (
        <div role="status" className="mt-5">
          <p className="text-sm leading-7">{c.failed}</p>
          <button
            className={link}
            onClick={() => {
              setState(undefined);
              setRetry((value) => value + 1);
            }}
          >
            {c.retry}
          </button>
        </div>
      )}
      {result && (
        <>
          {result.fetchedAt && (
            <p className="mt-5 text-xs leading-6 text-[#c4d3ca]">
              {c.checked}:{" "}
              <time dateTime={result.fetchedAt}>
                {new Date(result.fetchedAt).toLocaleString(locale)}
              </time>
              {result.matchedModels.length > 0 && (
                <>
                  {" "}
                  · {c.scope}: {result.matchedModels.join(", ")} · {year}
                </>
              )}
            </p>
          )}
          {stale && (
            <p role="status" className="mt-3 text-sm text-[#f4d4a4]">
              {c.stale}
            </p>
          )}
          {!records.length && (
            <p className="mt-4 rounded-xl border border-white/20 p-4 text-sm leading-7">
              {result.status === "available"
                ? c.empty
                : result.reason === "concept"
                  ? c.concept
                  : result.reason === "historic"
                    ? c.historic
                    : c.unsupported}
            </p>
          )}
          <div className="mt-5 space-y-4">
            {records.slice(0, expanded ? records.length : 4).map((record) => (
              <article
                key={record.campaign}
                className="rounded-2xl border border-white/20 bg-[#0b2326] p-5"
              >
                <p className="text-xs leading-6 text-[#d6aa92]">
                  {c.evidence} · {record.campaign}
                </p>
                <h3 className="mt-2 text-lg font-semibold break-words">
                  {record.component}
                </h3>
                {record.parkIt && (
                  <p className="mt-3 rounded-lg border border-[#f4b6a2] p-3 text-sm text-[#f4b6a2]">
                    {c.park}
                  </p>
                )}
                {record.parkOutside && (
                  <p className="mt-3 text-sm text-[#f4d4a4]">{c.outside}</p>
                )}
                <p className="mt-3 text-sm leading-7 text-[#d0dbd2]">
                  {record.summary}
                </p>
                <details className="mt-4">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2">
                    {c.details}
                  </summary>
                  <dl className="space-y-4 pt-3 text-sm leading-7">
                    {record.consequence && (
                      <div>
                        <dt className="font-semibold">{c.consequence}</dt>
                        <dd className="text-[#d0dbd2]">{record.consequence}</dd>
                      </div>
                    )}
                    {record.remedy && (
                      <div>
                        <dt className="font-semibold">{c.remedy}</dt>
                        <dd className="text-[#d0dbd2]">{record.remedy}</dd>
                      </div>
                    )}
                    {record.reportedAt && (
                      <div>
                        <dt className="font-semibold">{c.reportDate}</dt>
                        <dd>{record.reportedAt}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-4 text-xs text-[#c4d3ca]">{c.original}</p>
                </details>
                <a
                  className={`${link} mt-2`}
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.open}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          {records.length > 4 && (
            <button
              type="button"
              className={link}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? c.fewer : c.more} ({records.length})
            </button>
          )}
        </>
      )}
      <aside className="mt-6 border-t border-white/20 pt-5">
        <h3 className="font-semibold">{c.market}</h3>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-[#c4d3ca]">
          {c.marketText}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-6">
          <a
            className={link}
            href="https://www.kba-online.de/rrdb/buerger/"
            target="_blank"
            rel="noreferrer"
          >
            {c.kba}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            className={link}
            href="https://www.nhtsa.gov/recalls"
            target="_blank"
            rel="noreferrer"
          >
            {c.nhtsa}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </aside>
      <p className="mt-4 text-xs leading-6 text-[#c4d3ca]">{c.cache}</p>
      <details className="mt-5 border-t border-white/20 pt-4">
        <summary className="min-h-11 cursor-pointer py-2 font-medium focus-visible:outline-2">
          {c.coverage}
        </summary>
        <p className="mt-2 text-sm leading-7 text-[#c4d3ca]">
          {c.coverageNote}
        </p>
        <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {garageCarCatalog.map((car) => {
            const mapping = problemSourceMappings[car.id];
            return (
              <li
                key={car.id}
                className="rounded-xl border border-white/20 p-3"
              >
                <strong>
                  {car.make} {car.model} · {car.platform} ·{" "}
                  {car.years.join("–")}
                </strong>
                <p className="mt-1 text-xs leading-6 text-[#c4d3ca]">
                  {mapping?.models.length
                    ? c.lookup
                    : mapping?.reason === "concept"
                      ? c.prototype
                      : mapping?.reason === "historic"
                        ? c.history
                        : c.gap}
                </p>
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
