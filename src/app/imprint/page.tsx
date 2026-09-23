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
        className="rounded-[1.5rem] border border-[#0e2d30]/10 bg-[#0e2d30] p-5 text-[#e8e6d7] sm:p-6"
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-[#bf8269] uppercase">
          {t("contents")}
        </p>
        <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <li>
            <a
              href="#service-provider"
              aria-label={t("provider")}
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 transition-colors hover:bg-white/6 focus-visible:bg-white/6"
            >
              <span className="font-mono text-xs text-[#bf8269]">01</span>
              <span className="text-white/72 group-hover:text-white">
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
              <span className="font-mono text-xs text-[#bf8269]">02</span>
              <span className="text-white/72 group-hover:text-white">
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
              className="font-medium text-[#0e2d30] underline decoration-[#bf8269]/55 underline-offset-4 transition-colors hover:decoration-[#bf8269]"
            >
              {legal.privacyContact}
            </a>
          ) : (
            t("contactPending")
          )}
        </p>
      </LegalSection>
      {!legal.complete && (
        <p className="rounded-2xl border border-[#6d0101]/15 bg-[#6d0101]/6 p-5 text-[#6d0101]">
          {t("blocked")}
        </p>
      )}
    </LegalShell>
  );
}
