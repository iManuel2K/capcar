"use client";
import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CarFront,
  Check,
  ClipboardCheck,
  History,
  IdCard,
  Layers3,
  Lightbulb,
  MapPinned,
  ShieldCheck,
  WandSparkles,
  Wrench,
} from "lucide-react";
import { homepageCopy } from "@/features/marketing/homepage-copy";
import { platformCopy } from "@/features/marketing/platform-copy";
import type { AppLocale } from "@/i18n/config";
import { BuildTransformation } from "./build-transformation";
import { HomepageLink } from "./homepage-link";
import { SiteFooter } from "./site-footer";
import shared from "./homepage.module.css";
import styles from "./platform.module.css";
const icons = [CarFront, WandSparkles, Layers3, Wrench, IdCard, MapPinned];
export function PlatformOverview({ locale = "en" }: { locale?: AppLocale }) {
  const c = homepageCopy[locale],
    p = platformCopy[locale];
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const labels = [
    p.garage,
    p.studio,
    c.build,
    c.maintain,
    c.passport,
    p.roadbook,
  ];
  const descriptions = [
    p.garageText,
    c.visualText,
    c.buildText,
    c.maintainText,
    c.passportText,
    c.drivesText,
  ];
  const routes = [
    "/garage/new",
    "/studio",
    "/garage/new?goal=modify",
    "/garage/new?goal=maintain",
    "/garage",
    "/roadbook",
  ];
  const Icon = icons[selected];
  const euro = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  const journey = [
    { title: c.idea, text: c.ideaText, icon: Lightbulb },
    { title: c.parts, text: c.partsText, icon: Layers3 },
    { title: c.guide, text: c.guideText, icon: Wrench },
    { title: c.record, text: c.recordText, icon: ClipboardCheck },
    { title: c.history, text: c.historyText, icon: History },
  ];
  return (
    <div className={styles.page}>
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="platform-heading">
          <div className={styles.heroInner}>
            <div>
              <p className={styles.eyebrow}>CAPCAR / {p.label}</p>
              <h1 id="platform-heading">{p.title}</h1>
              <p className={styles.lead}>{p.description}</p>
              <div className={styles.actions}>
                <HomepageLink
                  href="/garage/new"
                  placement="hero"
                  className={shared.primary}
                >
                  {c.create}
                  <ArrowRight size={17} aria-hidden="true" />
                </HomepageLink>
                <a href="#connected-car" className={shared.secondary}>
                  {p.explore}
                  <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
              <p className={styles.fine}>{c.account}</p>
            </div>
            <div className={styles.constellation} aria-label={p.explore}>
              <svg
                viewBox="0 0 600 450"
                preserveAspectRatio="none"
                aria-hidden="true"
                className={styles.connections}
              >
                <path d="M80 55 Q300 140 300 225 M300 45 V225 M520 55 Q300 140 300 225 M80 390 Q300 310 300 225 M300 405 V225 M520 390 Q300 310 300 225" />
                <circle cx="300" cy="225" r="140" />
              </svg>
              <div className={styles.nodeRow}>
                {labels.slice(0, 3).map((label, index) => {
                  const I = icons[index];
                  return (
                    <a
                      href="#connected-car"
                      onClick={() => setSelected(index)}
                      key={label}
                      className={styles.node}
                    >
                      <I aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
              <div className={styles.heroCar}>
                <Image
                  src="/garage/cutouts/bmw-318i.webp"
                  alt="BMW 318i · E90 · 2011"
                  fill
                  sizes="(min-width: 1000px) 45vw, 90vw"
                  className={styles.contain}
                  preload
                />
              </div>
              <div className={styles.nodeRow}>
                {labels.slice(3).map((label, index) => {
                  const I = icons[index + 3];
                  return (
                    <a
                      href="#connected-car"
                      onClick={() => setSelected(index + 3)}
                      key={label}
                      className={styles.node}
                    >
                      <I aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
              <p className={styles.identity}>2011 / BMW 318i / E90</p>
            </div>
          </div>
        </section>
        <section
          id="connected-car"
          aria-labelledby="connected-heading"
          className={styles.section}
        >
          <p className={styles.eyebrow}>{p.label}</p>
          <h2 id="connected-heading">{p.connect}</h2>
          <p className={styles.intro}>
            {p.description} {c.sample}.
          </p>
          <div role="tablist" aria-label={p.choose} className={styles.tabs}>
            {labels.map((label, index) => {
              const I = icons[index];
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${index}`}
                  aria-controls={`${id}-panel`}
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  ref={(el) => {
                    tabs.current[index] = el;
                  }}
                  onClick={() => setSelected(index)}
                  onKeyDown={(e) => {
                    const next =
                      e.key === "ArrowRight"
                        ? (index + 1) % 6
                        : e.key === "ArrowLeft"
                          ? (index + 5) % 6
                          : e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? 5
                              : null;
                    if (next !== null) {
                      e.preventDefault();
                      setSelected(next);
                      tabs.current[next]?.focus();
                    }
                  }}
                >
                  <I aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            tabIndex={0}
            id={`${id}-panel`}
            aria-labelledby={`${id}-tab-${selected}`}
            className={styles.panel}
          >
            <div className={styles.panelText}>
              <span className={styles.status}>
                {selected === 1 ? p.preview : p.available}
              </span>
              <Icon aria-hidden="true" className={styles.panelIcon} />
              <h3>{labels[selected]}</h3>
              <p>{descriptions[selected]}</p>
              <p className={styles.access}>
                {selected === 2
                  ? c.buildAccess
                  : selected === 3
                    ? c.maintainAccess
                    : selected === 5
                      ? c.drivesAccess
                      : selected === 4
                        ? c.ownerRecorded
                        : c.account}
              </p>
              <Link href={routes[selected]} className={shared.secondary}>
                {c.open}: {labels[selected]}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.demo}>
              <p className={styles.demoLabel}>{c.sample} / BMW 318i</p>
              {selected === 0 && (
                <>
                  <div className={styles.garageCar}>
                    <Image
                      src="/garage/cutouts/bmw-318i.webp"
                      alt="BMW 318i · E90 · 2011"
                      fill
                      sizes="(min-width:900px) 40vw,90vw"
                      className={styles.contain}
                    />
                  </div>
                  <h4>BMW 318i</h4>
                  <p className={styles.demoNote}>2011 · E90 · N43</p>
                  <div className={styles.record}>
                    <Wrench aria-hidden="true" />
                    <span>
                      {c.next}
                      <strong>{c.task}</strong>
                    </span>
                  </div>
                </>
              )}
              {selected === 1 && <BuildTransformation />}
              {selected === 2 && (
                <>
                  <h4>{c.project}</h4>
                  <dl className={styles.stats}>
                    {[
                      [c.budget, 300],
                      [c.planned, 30],
                      [c.actual, 28],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{euro(Number(value))}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className={styles.progress} aria-hidden="true">
                    <span />
                  </div>
                  <p className={styles.demoNote}>{c.progress}</p>
                  <p className={styles.demoNote}>{c.progressNote}</p>
                </>
              )}
              {selected === 3 && (
                <>
                  <h4>{c.maintain}</h4>
                  <div className={styles.record}>
                    <Wrench aria-hidden="true" />
                    <span>
                      <strong>{c.task}</strong>
                      {c.due}
                    </span>
                  </div>
                  <div className={styles.record}>
                    <Check aria-hidden="true" />
                    <span>
                      <strong>{c.completedTask}</strong>
                      {c.done}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/journal/bmw-wochenendprojekt-planen`}
                    className={shared.secondary}
                  >
                    {c.guideName}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              )}
              {selected === 4 && (
                <>
                  <h4>{c.passport}</h4>
                  <ol className={styles.timeline}>
                    {[c.idea, c.record, c.history].map((label, i) => (
                      <li key={label}>
                        <History aria-hidden="true" />
                        <span>
                          <small>0{i + 1}</small>
                          <strong>{label}</strong>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className={styles.demoNote}>{c.ownerRecorded}</p>
                </>
              )}
              {selected === 5 && (
                <>
                  <div className={styles.map}>
                    <Image
                      src="/previews/roadbook.png"
                      alt={c.drivePhoto}
                      fill
                      sizes="(min-width:900px) 40vw,90vw"
                      className={styles.cover}
                    />
                  </div>
                  <p className={styles.mapCredit}>
                    ©{" "}
                    <a href="https://www.openstreetmap.org/copyright">
                      OpenStreetMap
                    </a>{" "}
                    · <a href="https://openfreemap.org/">OpenFreeMap</a> ·{" "}
                    <a href="https://openmaptiles.org/">OpenMapTiles</a>
                  </p>
                  <h4>{c.route}</h4>
                  <p className={styles.demoNote}>{c.routeDetail}</p>
                </>
              )}
            </div>
          </div>
        </section>
        <section className={styles.journey}>
          <div className={styles.section}>
            <p className={styles.eyebrow}>01 — 05 / BMW 318i</p>
            <h2>{p.journey}</h2>
            <p className={styles.intro}>{p.journeyText}</p>
            <ol className={styles.steps}>
              {journey.map(({ title, text, icon: I }, i) => (
                <li key={title}>
                  <span className={styles.stepNumber}>0{i + 1}</span>
                  <I aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          aria-labelledby="availability-heading"
          className={styles.section}
        >
          <h2 id="availability-heading">{p.availability}</h2>
          <p className={styles.intro}>{p.availabilityText}</p>
          <div className={styles.availabilityGrid}>
            {[
              {
                status: p.available,
                title: p.todayTitle,
                text: p.todayText,
                icon: Check,
              },
              {
                status: p.preview,
                title: p.previewTitle,
                text: p.previewText,
                icon: WandSparkles,
              },
              {
                status: p.planned,
                title: p.futureTitle,
                text: p.futureText,
                icon: Lightbulb,
              },
            ].map(({ status, title, text, icon: I }) => (
              <article key={status}>
                <span className={styles.status}>
                  <I size={14} aria-hidden="true" />
                  {status}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <Link href="/roadmap" className={shared.secondary}>
            {p.roadmap}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className={styles.privacy}>
          <div className={styles.section}>
            <ShieldCheck aria-hidden="true" />
            <div>
              <h2>{p.privacy}</h2>
              <p>{p.privacyText}</p>
            </div>
          </div>
        </section>
        <section className={styles.final}>
          <div className={styles.section}>
            <h2>{p.final}</h2>
            <HomepageLink
              href="/garage/new"
              placement="final"
              className={shared.primary}
            >
              {c.create}
              <ArrowRight size={17} aria-hidden="true" />
            </HomepageLink>
            <p className={styles.fine}>{c.account}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
