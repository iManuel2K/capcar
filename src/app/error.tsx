"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("ErrorUi");
  return (
    <main className="grid min-h-dvh place-items-center bg-[#e8e6d7] px-5 py-12 text-center text-[#0e2d30]">
      <section
        aria-labelledby="error-title"
        aria-live="polite"
        className="w-full max-w-2xl rounded-[2rem] border border-[#0e2d30]/10 bg-white/24 p-7 sm:p-12"
      >
        <div className="flex justify-center">
          <CapcarWordmark glow={false} />
        </div>
        <p className="mt-12 text-xs font-semibold tracking-[0.18em] text-[#9d5f4c] uppercase">
          {t("eyebrow")}
        </p>
        <h1
          id="error-title"
          className="mt-4 text-4xl leading-none font-medium tracking-[-0.055em] sm:text-6xl"
        >
          {t("title")}
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-[#0e2d30]/62">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#6d0101] px-6 text-sm font-semibold text-white transition hover:bg-[#830705] focus-visible:ring-3 focus-visible:ring-[#bf8269] focus-visible:ring-offset-3 focus-visible:outline-none"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#0e2d30]/16 px-6 text-sm font-semibold transition hover:bg-[#0e2d30]/6 focus-visible:ring-3 focus-visible:ring-[#bf8269] focus-visible:ring-offset-3 focus-visible:outline-none"
          >
            {t("home")}
          </Link>
        </div>
      </section>
    </main>
  );
}
