import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { getLegalConfiguration } from "@/features/legal/legal-config";
import { pageMetadata } from "@/features/seo/public-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalDocs.imprint");
  const description = await getTranslations("PageMeta");
  return pageMetadata("/imprint", t("meta"), description("imprint"));
}

export default async function ImprintPage() {
  const t = await getTranslations("LegalDocs.imprint");
  const legal = getLegalConfiguration();

  return (
    <LegalShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      variant="document"
    >
      <nav
        aria-label={t("contentsLabel")}
        className="border-foreground/10 bg-card text-foreground rounded-[1.5rem] border p-5 sm:p-6"
      >
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          {t("contents")}
        </p>
        <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <li>
            <a
              href="#service-provider"
              aria-label={t("provider")}
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-white/6 focus-visible:bg-white/6"
            >
              <span className="text-primary font-mono text-xs">01</span>
              <span className="group-hover:text-foreground text-white/72">
                {t("provider")}
              </span>
            </a>
          </li>
          <li>
            <a
              href="#contact"
              aria-label={t("contact")}
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-white/6 focus-visible:bg-white/6"
            >
              <span className="text-primary font-mono text-xs">02</span>
              <span className="group-hover:text-foreground text-white/72">
                {t("contact")}
              </span>
            </a>
          </li>
        </ol>
      </nav>

      <LegalSection id="service-provider" title={t("provider")}>
        <p>
          {legal.operator || t("operatorPending")}
          <br />
          {legal.address || t("addressPending")}
        </p>
      </LegalSection>
      <LegalSection id="contact" title={t("contact")}>
        <p>
          {legal.privacyContact ? (
            <a
              href={`mailto:${legal.privacyContact}`}
              className="text-foreground decoration-primary/55 hover:decoration-primary font-medium underline underline-offset-4 transition-colors"
            >
              {legal.privacyContact}
            </a>
          ) : (
            t("contactPending")
          )}
        </p>
      </LegalSection>
      {!legal.complete && (
        <p className="border-primary/15 bg-primary/6 text-primary rounded-2xl border p-5">
          {t("blocked")}
        </p>
      )}
    </LegalShell>
  );
}
