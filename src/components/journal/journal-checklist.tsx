"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { AppLocale } from "@/i18n/config";
import {
  checklistItems,
  checklistUI,
  featureLabel,
} from "@/features/journal/checklist-ui";
import {
  JOURNAL_CHECKLIST_EVENT,
  JOURNAL_CHECKLIST_KEY,
  JOURNAL_DRAFT_KEY,
  journalFeaturePath,
  journalWorkspacePath,
  readJournalChecklists,
  readJournalDraft,
  saveJournalChecklist,
  saveJournalDraft,
  type ChecklistInput,
  type JournalChecklistRecord,
} from "@/features/journal/checklists";
import {
  findJournalArticle,
  getJournalArticles,
  journalArticlePath,
} from "@/features/journal/articles";
import { useVehicles } from "@/features/vehicles/use-vehicles";
import { trackAnalytics } from "@/features/analytics/client";

const subscribeHydration = () => () => {};
const serverHydration = () => false;
const clientHydration = () => true;
const emptyRecords: JournalChecklistRecord[] = [];
let cachedRaw: string | null | undefined;
let cachedRecords = emptyRecords;
function checklistSnapshot() {
  try {
    const raw = localStorage.getItem(JOURNAL_CHECKLIST_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedRecords = readJournalChecklists(localStorage);
    }
    return cachedRecords;
  } catch {
    return emptyRecords;
  }
}
function subscribeRecords(callback: () => void) {
  window.addEventListener(JOURNAL_CHECKLIST_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(JOURNAL_CHECKLIST_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
const serverRecords = () => emptyRecords;

export function JournalChecklist({
  slug,
  locale,
}: {
  slug: string;
  locale: AppLocale;
}) {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientHydration,
    serverHydration,
  );
  const t = checklistUI[locale];
  return (
    <section
      id="checklist"
      aria-labelledby="checklist-title"
      className="mt-12 scroll-mt-24 rounded-3xl border border-[#0e2d30]/15 bg-[#f5f2e8] p-5 text-[#0e2d30] sm:p-8"
    >
      <h2 id="checklist-title" className="text-2xl font-medium tracking-tight">
        {t.title}
      </h2>
      <p className="mt-3 mb-6 leading-7">{t.intro}</p>
      {hydrated ? (
        <ChecklistForm slug={slug} locale={locale} />
      ) : (
        <p className="text-sm">{t.draft}</p>
      )}
    </section>
  );
}

function ChecklistForm({
  slug,
  locale,
  vehicleId,
  vehicleIds = [],
  savedRecord,
  inWorkspace = false,
}: {
  slug: string;
  locale: AppLocale;
  vehicleId?: string;
  vehicleIds?: string[];
  savedRecord?: JournalChecklistRecord;
  inWorkspace?: boolean;
}) {
  const router = useRouter();
  const t = checklistUI[locale];
  const article = findJournalArticle(slug, locale)!;
  const [values, setValues] = useState<ChecklistInput>(
    () =>
      readJournalDraft(slug, localStorage) ??
      savedRecord ?? {
        title: article.title.slice(0, 120),
        notes: "",
        checked: [],
      },
  );
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const items = checklistItems(slug, locale);
  function draft() {
    saveJournalDraft(slug, values, localStorage);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(false);
    try {
      if (inWorkspace && !vehicleId) {
        addVehicle();
        return;
      }
      if (!vehicleId) {
        draft();
        trackAnalytics("journal_action_clicked", { article_slug: slug });
        router.push(journalWorkspacePath(slug, locale));
        return;
      }
      saveJournalChecklist(
        {
          ...values,
          checked: values.checked.filter((id) =>
            items.some((item) => item.id === id),
          ),
          articleSlug: slug,
          vehicleId,
        },
        localStorage,
        vehicleIds,
      );
      localStorage.removeItem(JOURNAL_DRAFT_KEY);
      window.dispatchEvent(new Event(JOURNAL_CHECKLIST_EVENT));
      trackAnalytics("journal_checklist_saved", { article_slug: slug });
      setSaved(true);
    } catch {
      setError(true);
    }
  }
  function addVehicle() {
    try {
      draft();
      router.push(
        `/garage/new?next=${encodeURIComponent(journalWorkspacePath(slug, locale))}`,
      );
    } catch {
      setError(true);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-5"
      onChange={() => setSaved(false)}
    >
      <label className="block text-sm font-semibold">
        {t.job}
        <input
          required
          minLength={2}
          maxLength={120}
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="mt-2 block min-h-12 w-full rounded-xl border border-[#0e2d30]/25 bg-white px-4 py-3 text-base text-[#0e2d30]"
        />
      </label>
      <fieldset className="space-y-3">
        <legend className="sr-only">{t.title}</legend>
        {items.map((item) => (
          <label
            key={item.id}
            className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-[#0e2d30]/15 bg-white/60 px-4 py-3 text-sm leading-6"
          >
            <input
              type="checkbox"
              checked={values.checked.includes(item.id)}
              onChange={(e) =>
                setValues({
                  ...values,
                  checked: e.target.checked
                    ? [...values.checked, item.id]
                    : values.checked.filter((id) => id !== item.id),
                })
              }
              className="mt-1 size-4 shrink-0 accent-[#0e2d30]"
            />
            {item.label}
          </label>
        ))}
      </fieldset>
      <label className="block text-sm font-semibold">
        {t.notes}
        <textarea
          maxLength={1500}
          rows={4}
          value={values.notes}
          onChange={(e) => setValues({ ...values, notes: e.target.value })}
          className="mt-2 block w-full rounded-xl border border-[#0e2d30]/25 bg-white px-4 py-3 text-base font-normal text-[#0e2d30]"
        />
      </label>
      {!vehicleId && (
        <p className="text-sm leading-6 text-[#405856]">{t.draft}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center rounded-full bg-[#0e2d30] px-5 py-3 text-sm font-semibold text-[#e8e6d7]"
        >
          {vehicleId ? t.save : inWorkspace ? t.addVehicle : t.continue} →
        </button>
        {(vehicleId || !inWorkspace) && (
          <button
            type="button"
            onClick={addVehicle}
            className="min-h-12 rounded-full border border-[#0e2d30]/30 px-5 py-3 text-sm font-semibold"
          >
            {t.addVehicle}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-[#6d0101]">
          {t.error}
        </p>
      )}
      {saved && (
        <div
          role="status"
          className="rounded-xl border border-[#0e2d30]/20 p-4 text-sm"
        >
          <p>{t.saved}</p>
          <Link
            href={journalFeaturePath(slug, vehicleId!)}
            className="mt-2 inline-flex min-h-11 items-center font-semibold underline"
          >
            {featureLabel(slug, locale)} →
          </Link>
        </div>
      )}
    </form>
  );
}

export function JournalWorkspace({
  locale,
  articleSlug,
  initialVehicleId,
}: {
  locale: AppLocale;
  articleSlug?: string;
  initialVehicleId?: string;
}) {
  const { vehicles } = useVehicles();
  const records = useSyncExternalStore(
    subscribeRecords,
    checklistSnapshot,
    serverRecords,
  );
  const [vehicleChoice, setVehicleChoice] = useState(initialVehicleId ?? "");
  const selected =
    vehicles.find((v) => v.id === vehicleChoice) ??
    (vehicles.length === 1 ? vehicles[0] : undefined);
  const [articleChoice, setArticleChoice] = useState(articleSlug ?? "");
  const article = findJournalArticle(articleChoice, locale);
  const t = checklistUI[locale];
  return (
    <main className="mx-auto max-w-4xl rounded-3xl bg-[#ebe9dc] p-5 text-[#0e2d30] sm:p-8">
      <h1 className="text-3xl font-medium">{t.heading}</h1>
      {selected && (
        <Link
          href={`/garage/${encodeURIComponent(selected.id)}`}
          className="mt-3 inline-flex min-h-11 items-center underline"
        >
          ← {t.back}
        </Link>
      )}
      <label className="mt-5 block text-sm font-semibold">
        {t.selectVehicle}
        <select
          value={selected?.id ?? ""}
          onChange={(e) => setVehicleChoice(e.target.value)}
          className="mt-2 block min-h-12 w-full rounded-xl border border-[#0e2d30]/25 bg-white px-4 text-base text-[#0e2d30]"
        >
          {!selected && <option value="">{t.choose}</option>}
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.productionYear} {v.make} {v.model}
              {v.nickname ? ` · ${v.nickname}` : ""}
            </option>
          ))}
        </select>
      </label>
      {article && (selected || vehicles.length === 0) && (
        <section className="mt-8 rounded-2xl bg-[#f5f2e8] p-5">
          <h2 className="mb-4 text-2xl font-medium">{article.title}</h2>
          <Link
            href={journalArticlePath(article.slug, locale)}
            className="mb-5 inline-flex min-h-11 items-center text-sm underline"
          >
            {t.article} →
          </Link>
          <ChecklistForm
            inWorkspace
            key={`${article.slug}:${selected?.id ?? "new"}`}
            slug={article.slug}
            locale={locale}
            vehicleId={selected?.id}
            vehicleIds={vehicles.map((v) => v.id)}
            savedRecord={records.find(
              (r) =>
                r.vehicleId === selected?.id && r.articleSlug === article.slug,
            )}
          />
        </section>
      )}
      {!article && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {getJournalArticles(locale).map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setArticleChoice(item.slug)}
              className="min-h-16 rounded-xl border border-[#0e2d30]/20 bg-white/50 p-4 text-left text-sm font-semibold"
            >
              {item.title} →
            </button>
          ))}
        </div>
      )}
      <section className="mt-10 border-t border-[#0e2d30]/20 pt-6">
        <h2 className="text-xl font-medium">{t.heading}</h2>
        {records.filter((r) => r.vehicleId === selected?.id).length === 0 ? (
          <p className="mt-3 text-sm">{t.empty}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {records
              .filter((r) => r.vehicleId === selected?.id)
              .map((record) => (
                <li
                  key={record.articleSlug}
                  className="rounded-xl border border-[#0e2d30]/20 p-4"
                >
                  <p className="font-semibold">{record.title}</p>
                  <p className="mt-1 text-sm">
                    {record.checked.length}/
                    {checklistItems(record.articleSlug, locale).length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setArticleChoice(record.articleSlug)}
                    className="mt-2 min-h-11 text-sm font-semibold underline"
                  >
                    {t.edit}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
