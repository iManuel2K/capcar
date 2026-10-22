import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, CircleDashed, Rocket, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getDeploymentReadiness } from "@/features/deployment/deployment-readiness";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function LaunchPage() {
  const readiness = getDeploymentReadiness();
  const t = await getTranslations("Operations");
  return (
    <main className="bg-background text-foreground min-h-dvh px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/system" className="text-primary text-sm">
          {t("systemBack")}
        </Link>
        <header className="mt-12 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(184,199,217,0.22),transparent_30%),#111111] p-7 sm:p-10">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            {t("launchEyebrow")}
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            {t("launchTitle", {
              state: t(`states.${readiness.state}`),
            })}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
            {t("launchDescription")}
          </p>
        </header>
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          {readiness.checks.map((check) => (
            <article
              key={check.key}
              className="bg-card rounded-2xl border border-white/10 p-5"
            >
              <div className="flex gap-3">
                {check.ready ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-200" />
                ) : (
                  <CircleDashed className="mt-0.5 size-5 shrink-0 text-amber-200" />
                )}
                <div>
                  <h2 className="font-medium text-white/80">
                    {t(`checks.${check.key}.label`)}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {t(
                      `checks.${check.key}.${check.ready ? "ready" : "pending"}`,
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="bg-card mt-5 rounded-[2rem] border border-white/10 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-medium">
            <Rocket className="text-primary size-5" /> {t("activation")}
          </h2>
          <ol className="text-muted-foreground mt-6 grid gap-3 text-sm leading-6 sm:grid-cols-2">
            <li className="rounded-xl border border-white/8 p-4">
              1. {t("steps.one")}
            </li>
            <li className="rounded-xl border border-white/8 p-4">
              2. {t("steps.two")}
            </li>
            <li className="rounded-xl border border-white/8 p-4">
              3. {t("steps.three")}
            </li>
            <li className="rounded-xl border border-white/8 p-4">
              4. {t("steps.four")}
            </li>
            <li className="rounded-xl border border-white/8 p-4">
              5. {t("steps.five")}
            </li>
            <li className="rounded-xl border border-white/8 p-4">
              6. {t("steps.six")}
            </li>
          </ol>
        </section>
        <aside className="border-primary/15 bg-primary/6 text-muted-foreground mt-5 flex gap-3 rounded-2xl border p-5 text-sm leading-6">
          <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
          {t("launchSafety")}
        </aside>
      </div>
    </main>
  );
}
