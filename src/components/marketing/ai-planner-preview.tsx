import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import type { AppLocale } from "@/i18n/config";
import { aiPreviewCopy } from "@/features/marketing/ai-preview-copy";
import { SiteFooter } from "./site-footer";
import shared from "./homepage.module.css";
import styles from "./ai-planner-preview.module.css";

export function AIPlannerPreview({
  locale,
  returnTo = "/ai",
}: {
  locale: AppLocale;
  returnTo?: string;
}) {
  const c = aiPreviewCopy[locale];
  const next = encodeURIComponent(returnTo);
  return (
    <div className={shared.page}>
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="ai-preview-title">
          <div className={styles.intro}>
            <p className={shared.eyebrow}>{c.eyebrow}</p>
            <h1 id="ai-preview-title" className={shared.pageTitle}>
              {c.title}
            </h1>
            <p className={styles.lead}>{c.description}</p>
            <div className={shared.actions}>
              <Link href={`/register?next=${next}`} className={shared.primary}>
                {c.create}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href={`/login?next=${next}`} className={shared.secondary}>
                {c.signIn}
              </Link>
            </div>
            <p className={styles.access}>{c.access}</p>
            <Link href="/roadbook" className={shared.secondary}>
              {c.roadbook}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <article
            className={styles.example}
            aria-labelledby="ai-example-title"
          >
            <p className={styles.label}>{c.example}</p>
            <div className={styles.prompt}>
              <p className={styles.label}>{c.promptLabel}</p>
              <blockquote>{c.prompt}</blockquote>
            </div>
            <h2 id="ai-example-title">
              <MapPinned aria-hidden="true" size={22} />
              {c.result}
            </h2>
            <ol className={styles.route}>
              {c.stops.map((stop, i) => (
                <li key={stop}>
                  <span aria-hidden="true">0{i + 1}</span>
                  {stop}
                </li>
              ))}
            </ol>
            <details className={styles.map}>
              <summary>{c.routePreview}</summary>
              <Image
                src="/ai/capcar-route-demo.gif"
                alt={c.routeAlt}
                width={713}
                height={470}
                unoptimized
                className={styles.animation}
              />
              <p className={styles.credit}>
                ©{" "}
                <a href="https://www.openstreetmap.org/copyright">
                  OpenStreetMap
                </a>
              </p>
            </details>
            <p className={styles.note}>{c.note}</p>
          </article>
        </section>
        <section className={shared.section} aria-labelledby="ai-steps-title">
          <h2 id="ai-steps-title" className={shared.title}>
            {c.how}
          </h2>
          <ol className={styles.steps}>
            {c.steps.map((step, i) => (
              <li key={step}>
                <span aria-hidden="true">0{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
