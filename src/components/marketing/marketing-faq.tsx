"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./launch.module.css";
import homepageStyles from "./homepage.module.css";
const questions = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
] as const;
export function MarketingFaq() {
  const t = useTranslations("Launch.faq");
  const nav = useTranslations("Navigation");
  return (
    <section
      id="faq"
      className="capcar-light-section border-border scroll-mt-8 border-y"
      aria-labelledby="faq-title"
    >
      <div className={`${styles.section} grid gap-8 lg:grid-cols-[.7fr_1.3fr]`}>
        <div>
          <p className="text-primary text-xs tracking-widest">FAQ</p>
          <h2 id="faq-title" className={`${styles.title} mt-4`}>
            {t("title")}
          </h2>
          <Link href="/roadmap" className={`${styles.link} mt-5`}>
            {nav("roadmap")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div>
          {questions.map((key) => (
            <details
              key={key}
              className={`group border-foreground/20 border-t last:border-b ${homepageStyles.faqItem}`}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-base font-medium marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
                {t(`${key}.question`)}
                <Plus
                  aria-hidden="true"
                  className="size-4 shrink-0 group-open:rotate-45 motion-safe:transition-transform"
                />
              </summary>
              <p className="text-muted-foreground max-w-2xl pr-8 pb-5 text-sm leading-7">
                {t(`${key}.answer`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
