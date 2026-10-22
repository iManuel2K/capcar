import Link from "next/link";
import { useTranslations } from "next-intl";

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
    <main
      id="main-content"
      className="bg-background text-foreground min-h-[calc(100dvh-4.5rem)] px-4 py-8 sm:min-h-[calc(100dvh-5rem)] sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-5xl">
        {documentLayout ? (
          <section className="mx-auto mt-8 max-w-3xl sm:mt-12">
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.06em] sm:text-7xl">
              {title}
            </h1>
            <aside className="border-foreground/10 mt-8 rounded-[1.5rem] border bg-white/24 p-5 sm:p-6">
              <p className="text-foreground text-xs font-semibold tracking-[0.12em] uppercase">
                {t("notice")}
              </p>
              <p className="text-foreground/58 mt-2 max-w-2xl text-sm leading-6">
                {description}
              </p>
            </aside>
          </section>
        ) : (
          <section className="bg-card text-foreground overflow-hidden rounded-[2rem] p-6 sm:rounded-[2.5rem] sm:p-12 lg:p-16">
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[0.94] font-medium tracking-[-0.055em] sm:text-7xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl leading-7">
              {description}
            </p>
          </section>
        )}

        <article
          className={`mx-auto max-w-3xl ${documentLayout ? "py-8 sm:py-12" : "py-14 sm:py-20"}`}
        >
          <div className="text-foreground/68 space-y-10 text-sm leading-7 sm:text-base">
            {children}
          </div>
        </article>

        <footer className="border-foreground/10 text-muted-foreground flex flex-col gap-5 border-t py-10 text-xs sm:flex-row sm:items-center sm:justify-between">
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
      <h2 className="text-foreground text-2xl font-medium tracking-[-0.03em]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
