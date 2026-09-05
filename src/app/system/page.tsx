import Link from "next/link";
import { CheckCircle2, CircleDashed, ShieldCheck } from "lucide-react";

import { getAuthStatus } from "@/features/auth/auth-config";
import { getCopilotStatus } from "@/features/copilot/copilot-provider";
import { getProviderStatuses } from "@/features/providers/provider-config";

export const dynamic = "force-dynamic";

export default function SystemPage() {
  const auth = getAuthStatus();
  const copilot = getCopilotStatus();
  const providers = getProviderStatuses();
  const checks = [
    {
      label: "Production build and strict TypeScript",
      ready: true,
      detail: "Automated validation included",
    },
    {
      label: "Security headers",
      ready: true,
      detail: "Frame, MIME, referrer and permission protections",
    },
    {
      label: "Installable web app shell",
      ready: true,
      detail: "Manifest, icon and production service worker",
    },
    {
      label: "Supabase account sync",
      ready: auth.configured,
      detail: auth.message,
    },
    {
      label: "External AI copilot",
      ready: copilot.mode === "external" && copilot.configured,
      detail: `${copilot.providerName} · ${copilot.mode}`,
    },
    ...providers.map((provider) => ({
      label: provider.label,
      ready: provider.mode === "external" && provider.configured,
      detail: `${provider.providerName} · ${provider.mode}`,
    })),
  ];
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-16 text-[#f4f5f2]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-[#8ab7ff]">
          ← Capcar
        </Link>
        <header className="mt-12 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_84%_15%,rgba(116,167,255,0.2),transparent_30%),#111512] p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#8ab7ff] uppercase">
            Epic 19 · System readiness
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Production foundations are visible.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">
            Green means the application capability is present. Pending
            integrations remain honest until credentials, licensing and
            production policies are complete.
          </p>
        </header>
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          {checks.map((check) => (
            <article
              key={check.label}
              className="rounded-2xl border border-white/10 bg-[#111512] p-5"
            >
              <div className="flex items-start gap-3">
                {check.ready ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-200" />
                ) : (
                  <CircleDashed className="mt-0.5 size-5 shrink-0 text-amber-200" />
                )}
                <div>
                  <h2 className="font-medium text-white/80">{check.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/40">
                    {check.detail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
        <aside className="mt-5 flex gap-3 rounded-2xl border border-[#74a7ff]/15 bg-[#74a7ff]/6 p-5 text-sm leading-6 text-white/45">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9ec2ff]" />
          This page never exposes API keys. It reports only activation state and
          provider names.
        </aside>
      </div>
    </main>
  );
}
