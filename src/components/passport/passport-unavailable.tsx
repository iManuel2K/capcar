import Link from "next/link";
import { Link2Off } from "lucide-react";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";
import { useTranslations } from "next-intl";

export function PassportUnavailable() {
  const t = useTranslations("PublicStates");
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0b0e0c] px-5 text-center text-[#f4f5f2]">
      <section className="max-w-xl">
        <CapcarWordmark />
        <Link2Off className="mx-auto mt-12 size-8 text-[#ff667a]" />
        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/35 uppercase">
          {t("passportEyebrow")}
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
          {t("passportTitle")}
        </h1>
        <p className="mt-5 leading-7 text-white/45">
          {t("passportDescription")}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#e72d45] px-5 text-sm font-semibold text-white"
        >
          {t("return")}
        </Link>
      </section>
    </main>
  );
}
