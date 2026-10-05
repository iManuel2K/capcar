"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  Check,
  CircleHelp,
  IdCard,
  QrCode,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { BuildTransformation } from "./build-transformation";
import styles from "./launch.module.css";

const views = ["plan", "parts", "visual", "history"] as const;
type View = (typeof views)[number];
const modifications = ["lights", "wheels", "service"] as const;
type Modification = (typeof modifications)[number];
const amounts: Record<Modification, [number, number]> = {
  lights: [210, 195],
  wheels: [450, 420],
  service: [90, 80],
};
const nextSteps = {
  lights: "checkLights",
  wheels: "checkWheels",
  service: "checkService",
} as const;
const queries = {
  lights: "BMW E90 rear lights",
  wheels: "BMW E90 wheels",
  service: "BMW E90 service parts",
};
type PlannedItem = {
  modification: Modification;
  offer: number;
  amount: number;
  shipping: number | null;
};

export function ProductDashboardPreview() {
  const t = useTranslations("Launch");
  const locale = useLocale();
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [view, setView] = useState<View>("plan");
  const [goal, setGoal] = useState("oem");
  const [modification, setModification] = useState<Modification>("lights");
  const [offer, setOffer] = useState(0);
  const [planned, setPlanned] = useState<PlannedItem[]>([]);
  const [message, setMessage] = useState("");
  const currency = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  const spent = 1480;
  const budget = 3000;
  const plannedTotal = planned.reduce(
    (sum, item) => sum + item.amount + (item.shipping ?? 0),
    0,
  );
  const incomplete = planned.some((item) => item.shipping === null);
  const alreadyAdded = planned.some(
    (item) => item.modification === modification && item.offer === offer,
  );

  useEffect(() => {
    const fromHash = () => {
      const next = window.location.hash.replace("#demo-", "");
      if (views.includes(next as View)) setView(next as View);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function selectView(next: View) {
    setView(next);
    window.history.replaceState(null, "", `#demo-${next}`);
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % views.length;
    else if (event.key === "ArrowLeft")
      next = (index + views.length - 1) % views.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = views.length - 1;
    else return;
    event.preventDefault();
    selectView(views[next]);
    tabs.current[next]?.focus();
  }

  function addPart() {
    setPlanned((items) => [
      ...items.filter((item) => item.modification !== modification),
      {
        modification,
        offer,
        amount: amounts[modification][offer],
        shipping: offer === 0 ? 15 : null,
      },
    ]);
    setMessage(t("demo.added"));
  }

  return (
    <section
      id="live-demo"
      className="scroll-mt-6 bg-[#e8e6d7] text-[#0e2d30]"
      aria-labelledby="demo-title"
    >
      <div className={styles.section}>
        <p className={`${styles.eyebrow} text-[#80533e]!`}>
          {t("demo.eyebrow")}
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="demo-title" className={styles.title}>
            {t("demo.title")}
          </h2>
          <p className="max-w-xl text-base leading-7 text-[#4b6260]">
            {t("demo.description")}
          </p>
        </div>
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#0e2d30]/20 bg-[#0b2326] text-[#e8e6d7]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-5 py-4 sm:px-7">
            <div>
              <p className="text-lg font-medium">Project Streetline</p>
              <p className="mt-1 font-mono text-xs text-[#bfcac5]">
                BMW E90 318i · 2011
              </p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs focus-visible:outline-2"
              onClick={() => {
                setPlanned([]);
                setGoal("oem");
                setModification("lights");
                setOffer(0);
                selectView("plan");
                setMessage("");
              }}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              {t("demo.reset")}
            </button>
          </div>
          <div className="px-5 pt-3 text-xs leading-5 text-[#d8b69d] sm:px-7">
            {t("demo.sample")}
          </div>
          <div className="relative mt-3">
            {views.map((key) => (
              <span
                key={key}
                id={`demo-${key}`}
                className="absolute -top-6 scroll-mt-8"
                aria-hidden="true"
              />
            ))}
            <div
              role="tablist"
              aria-label={t("demo.tabs")}
              className="flex overflow-x-auto border-b border-white/15 px-2 sm:px-5"
            >
              {views.map((key, index) => (
                <button
                  key={key}
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-${key}`}
                  aria-controls={`${id}-panel`}
                  aria-selected={view === key}
                  tabIndex={view === key ? 0 : -1}
                  onKeyDown={(event) => handleTabKey(event, index)}
                  onClick={() => {
                    selectView(key);
                    setMessage("");
                  }}
                  className={styles.tab}
                >
                  {t(`demo.${key}`)}
                </button>
              ))}
            </div>
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-${view}`}
            tabIndex={0}
            className="min-h-[440px] p-5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] sm:p-7"
          >
            {view === "plan" && (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                <div>
                  <div className="relative aspect-[16/8] overflow-hidden rounded-xl bg-[#071519]">
                    <Image
                      src="/capcar-hero-bmw-garage.png"
                      alt={t("visual.alt")}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#bfcac5]">
                    {t("visual.note")}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      {t("demo.goal")}
                      <select
                        className={styles.field}
                        value={goal}
                        onChange={(event) => setGoal(event.target.value)}
                      >
                        <option value="oem">{t("demo.oem")}</option>
                        <option value="restore">{t("demo.restore")}</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      {t("demo.modification")}
                      <select
                        className={styles.field}
                        value={modification}
                        onChange={(event) => {
                          setModification(event.target.value as Modification);
                          setOffer(0);
                        }}
                      >
                        {modifications.map((item) => (
                          <option key={item} value={item}>
                            {t(`demo.${item}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs text-[#bfcac5]">{t("demo.phase")}</p>
                    <p className="mt-1 text-xl">{t("demo.phaseValue")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#bfcac5]">{t("demo.next")}</p>
                    <p className="mt-1 text-base leading-7">
                      {t(`demo.${nextSteps[modification]}`)}
                    </p>
                  </div>
                  {renderBudget()}
                  <button
                    type="button"
                    className={`${styles.primary} self-start`}
                    onClick={() => selectView("parts")}
                  >
                    {t("demo.compare")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
            {view === "parts" && (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl">{t(`demo.${modification}`)}</h3>
                  <Link
                    href={`/connected-parts?q=${encodeURIComponent(queries[modification])}`}
                    className={styles.link}
                  >
                    {t("demo.realSearch")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[0, 1].map((index) => (
                    <article key={index} className={styles.panel}>
                      <h4 className="font-medium">
                        {t("demo.offer", { number: index + 1 })}
                      </h4>
                      <p className={`${styles.label} mt-1`}>{t("demo.used")}</p>
                      <dl className="my-5 space-y-2 text-sm">
                        <Row
                          label={t("demo.item")}
                          value={currency(amounts[modification][index])}
                        />
                        <Row
                          label={t("demo.shipping")}
                          value={index === 0 ? currency(15) : t("demo.unknown")}
                        />
                        <Row
                          label={t("demo.total")}
                          value={
                            index === 0
                              ? currency(amounts[modification][index] + 15)
                              : t("demo.unknown")
                          }
                        />
                      </dl>
                      <span className={styles.badge}>
                        <CircleHelp className="size-3.5" aria-hidden="true" />
                        {t("demo.fitment")}
                      </span>
                      <p className={`${styles.label} mt-3`}>
                        {t("demo.seller")}
                      </p>
                      <button
                        type="button"
                        aria-pressed={offer === index}
                        onClick={() => {
                          setOffer(index);
                          setMessage("");
                        }}
                        className={`${styles.secondary} mt-4 w-full`}
                      >
                        {offer === index && (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                        {t(offer === index ? "demo.selected" : "demo.select")}
                      </button>
                    </article>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => selectView("visual")}
                  >
                    {t("demo.visual")}
                  </button>
                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={addPart}
                    className={`${styles.primary} disabled:cursor-default disabled:opacity-60`}
                  >
                    {t("demo.add")}
                  </button>
                </div>
                <p role="status" className="mt-3 text-sm text-[#d1e7d7]">
                  {message}
                </p>
              </div>
            )}
            {view === "visual" && (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <BuildTransformation />
                <div className="flex flex-col items-start gap-5">
                  <h3 className="text-2xl">{t("features.visual")}</h3>
                  <p className="text-sm leading-7 text-[#bfcac5]">
                    {t("demo.visualText")}
                  </p>
                  <Link href="/studio" className={styles.link}>
                    {t("features.studio")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={addPart}
                    className={`${styles.primary} disabled:opacity-60`}
                  >
                    {t("demo.add")}
                  </button>
                  <p role="status" className="text-sm text-[#d1e7d7]">
                    {message}
                  </p>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => selectView("history")}
                  >
                    {t("demo.history")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
            {view === "history" && (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <DemoVehiclePassport plannedCount={planned.length} />
                <div>
                  {renderBudget()}
                  {planned.length > 0 && (
                    <ul className="mt-4 space-y-3">
                      {planned.map((item) => (
                        <li
                          key={item.modification}
                          className="rounded-xl border border-white/15 p-4 text-sm"
                        >
                          <p className="font-medium">
                            {t(`demo.${item.modification}`)} ·{" "}
                            {currency(item.amount + (item.shipping ?? 0))}
                            {item.shipping === null ? " + ?" : ""}
                          </p>
                          <p className="mt-1 text-xs text-[#bfcac5]">
                            {t("demo.record")}
                          </p>
                          <button
                            type="button"
                            className={`${styles.link} mt-2`}
                            onClick={() =>
                              setPlanned((items) =>
                                items.filter(
                                  (entry) =>
                                    entry.modification !== item.modification,
                                ),
                              )
                            }
                          >
                            {t("demo.remove")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    className={`${styles.secondary} mt-5`}
                    type="button"
                    onClick={() => selectView("parts")}
                  >
                    {t("demo.compare")}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 px-5 py-4 sm:px-7">
            <p className="max-w-2xl text-xs leading-5 text-[#bfcac5]">
              {t("demo.session")}
            </p>
            <Link href="/register" className={styles.primary}>
              {t("start")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
  function renderBudget() {
    return (
      <div className="rounded-xl border border-white/20 p-4">
        <div className="flex justify-between gap-2 text-sm">
          <span>{t("demo.budget")}</span>
          <strong className="font-medium tabular-nums">
            {currency(budget)}
          </strong>
        </div>
        <div
          className="my-4 flex h-2 overflow-hidden rounded-full bg-white/15"
          aria-hidden="true"
        >
          <span
            className="bg-[#b9cbbf]"
            style={{ width: `${(spent / budget) * 100}%` }}
          />
          <span
            className="bg-[#bf8269]"
            style={{ width: `${(plannedTotal / budget) * 100}%` }}
          />
        </div>
        <dl className="space-y-2 text-sm tabular-nums">
          <Row label={t("demo.spent")} value={currency(spent)} />
          <Row
            label={t("demo.planned")}
            value={`${currency(plannedTotal)}${incomplete ? " + ?" : ""}`}
          />
          <Row
            label={t("demo.remaining")}
            value={
              incomplete
                ? t("demo.unknown")
                : currency(budget - spent - plannedTotal)
            }
          />
        </dl>
        {incomplete && (
          <p className="mt-3 text-xs text-[#eac99b]">
            {t("demo.shipping")}: {t("demo.unknown")}
          </p>
        )}
      </div>
    );
  }
}

function DemoVehiclePassport({ plannedCount }: { plannedCount: number }) {
  const t = useTranslations("Launch");
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#e8e6d7] text-[#0e2d30] shadow-[0_24px_70px_rgba(0,0,0,.25)]">
      <div className="grid min-h-[390px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-[#0e2d30]/10 pb-4">
            <span className="text-[10px] font-semibold tracking-[0.18em]">
              CAPCAR
            </span>
            <span className="rounded-full border border-[#6d0101]/15 bg-[#6d0101]/5 px-3 py-1 text-[9px] font-semibold tracking-[0.12em] text-[#6d0101] uppercase">
              {t("demo.passport.badge")}
            </span>
          </div>
          <p className="mt-6 text-[10px] font-semibold tracking-[0.16em] text-[#6d0101] uppercase">
            {t("demo.passport.eyebrow")}
          </p>
          <h3 className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
            2011 BMW 318i
          </h3>
          <p className="mt-2 text-sm text-[#405856]">E90 · N43B20 · Manual</p>

          <dl className="mt-7 grid gap-4 sm:grid-cols-2">
            <PassportField
              icon={IdCard}
              label={t("demo.passport.vin")}
              value="•••••••••••23860"
            />
            <PassportField
              icon={CarFront}
              label={t("demo.passport.mileage")}
              value="132,000 km"
            />
            <PassportField
              icon={CalendarCheck}
              label={t("demo.passport.inspection")}
              value="01/09/2027"
            />
            <PassportField
              icon={ShieldCheck}
              label={t("demo.passport.insurance")}
              value={t("demo.passport.notRecorded")}
            />
          </dl>

          <div className="mt-6 rounded-xl border border-dashed border-[#0e2d30]/15 px-4 py-3 text-xs text-[#405856]">
            {plannedCount > 0
              ? t("demo.passport.planned", { count: plannedCount })
              : t("demo.passport.private")}
          </div>
        </div>

        <div className="relative min-h-64 overflow-hidden bg-[#071519]">
          <Image
            src="/capcar-hero-bmw-e90.jpeg"
            alt={t("demo.passport.photoAlt")}
            fill
            sizes="(min-width: 1024px) 35vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071519] via-transparent to-transparent" />
          <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.14em] text-white/50 uppercase">
                {t("demo.passport.live")}
              </p>
              <p className="mt-1 max-w-48 text-xs leading-5 text-white/70">
                {t("demo.passport.scan")}
              </p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white text-[#0e2d30]">
              <QrCode className="size-9" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-[#0e2d30]/10 px-5 py-3 text-[9px] text-[#405856] sm:px-7">
        <span>{t("demo.passport.footer")}</span>
        <span>{t("demo.passport.verify")}</span>
      </div>
    </article>
  );
}

function PassportField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IdCard;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0e2d30]/6 text-[#6d0101]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[8px] font-semibold tracking-[0.12em] text-[#405856]/65 uppercase">
          {label}
        </dt>
        <dd className="mt-1 truncate text-xs font-medium">{value}</dd>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
