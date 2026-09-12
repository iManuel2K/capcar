import Link from "next/link";
import { useTranslations } from "next-intl";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export function LegalShell({
  eyebrow,
  title,
  description,
  children,
  variant = "hero",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  variant?: "hero" | "document";
}) {
  const t = useTranslations("Legal");
  const documentLayout = variant === "document";

  return (
    <main className="min-h-dvh bg-[#e8e6d7] px-4 py-5 text-[#0e2d30] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-5">
          <Link href="/" aria-label={t("home")}>
            <CapcarWordmark glow={false} />
          </Link>
          <Link href="/" className="text-sm font-medium text-[#0e2d30]/60">
            {t("back")}
          </Link>
        </header>

        {documentLayout ? (
          <section className="mx-auto mt-16 max-w-3xl sm:mt-24">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#9d5f4c] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.06em] sm:text-7xl">
              {title}
            </h1>
            <aside className="mt-8 rounded-[1.5rem] border border-[#0e2d30]/10 bg-white/24 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#0e2d30] uppercase">
                {t("notice")}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#0e2d30]/58">
                {description}
              </p>
            </aside>
          </section>
        ) : (
          <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#0e2d30] p-6 text-[#e8e6d7] sm:mt-14 sm:rounded-[2.5rem] sm:p-12 lg:p-16">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#bf8269] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl leading-7 text-white/55">
              {description}
            </p>
          </section>
        )}

        <article
          className={`mx-auto max-w-3xl ${documentLayout ? "py-8 sm:py-12" : "py-14 sm:py-20"}`}
        >
          <div className="space-y-10 text-sm leading-7 text-[#0e2d30]/68 sm:text-base">
            {children}
          </div>
        </article>

        <footer className="flex flex-col gap-5 border-t border-[#0e2d30]/10 py-10 text-xs text-[#0e2d30]/48 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("beta")}</span>
          <nav aria-label={t("navigation")} className="flex flex-wrap gap-5">
            <Link href="/privacy">{t("privacy")}</Link>
            <Link href="/terms">{t("terms")}</Link>
            <Link href="/imprint">{t("imprint")}</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#0e2d30]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
