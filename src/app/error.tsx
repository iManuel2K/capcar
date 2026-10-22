"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("ErrorUi");
  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-5 py-12 text-center">
      <section
        aria-labelledby="error-title"
        aria-live="polite"
        className="border-foreground/10 w-full max-w-2xl rounded-[2rem] border bg-white/24 p-7 sm:p-12"
      >
        <div className="flex justify-center">
          <CapcarWordmark glow={false} />
        </div>
        <p className="text-primary mt-12 text-xs font-semibold tracking-[0.18em] uppercase">
          {t("eyebrow")}
        </p>
        <h1
          id="error-title"
          className="mt-4 text-4xl leading-none font-medium tracking-[-0.055em] sm:text-6xl"
        >
          {t("title")}
        </h1>
        <p className="text-foreground/62 mx-auto mt-5 max-w-lg leading-7">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-offset-3 focus-visible:outline-none"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="border-foreground/16 hover:bg-card/6 focus-visible:ring-primary inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold transition focus-visible:ring-3 focus-visible:ring-offset-3 focus-visible:outline-none"
          >
            {t("home")}
          </Link>
        </div>
      </section>
    </main>
  );
}
