import Link from "next/link";
import { CheckCircle2, CircleDashed, Rocket, ShieldCheck } from "lucide-react";

import { getDeploymentReadiness } from "@/features/deployment/deployment-readiness";

export const dynamic = "force-dynamic";

export default function LaunchPage() {
  const readiness = getDeploymentReadiness();
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-16 text-[#f4f5f2]">
      <div className="mx-auto max-w-5xl">
        <Link href="/system" className="text-sm text-[#8ab7ff]">← System readiness</Link>
        <header className="mt-12 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(116,167,255,0.22),transparent_30%),#111512] p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#8ab7ff] uppercase">Epic 20 · Production launch</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Launch status: {readiness.state}.</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/45">Capcar stays fully usable in local mode. Production is only marked ready after the public URL and browser-safe Supabase settings are present on the production host.</p>
        </header>
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          {readiness.checks.map((check) => (
            <article key={check.key} className="rounded-2xl border border-white/10 bg-[#111512] p-5">
              <div className="flex gap-3">
                {check.ready ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-200" /> : <CircleDashed className="mt-0.5 size-5 shrink-0 text-amber-200" />}
                <div><h2 className="font-medium text-white/80">{check.label}</h2><p className="mt-2 text-sm leading-6 text-white/40">{check.detail}</p></div>
              </div>
            </article>
          ))}
        </section>
        <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#111512] p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-medium"><Rocket className="size-5 text-[#8ab7ff]" /> Activation sequence</h2>
          <ol className="mt-6 grid gap-3 text-sm leading-6 text-white/50 sm:grid-cols-2">
            <li className="rounded-xl border border-white/8 p-4">1. Create the Supabase project and run the included migrations.</li>
            <li className="rounded-xl border border-white/8 p-4">2. Push the repository to GitHub and import it into Vercel.</li>
            <li className="rounded-xl border border-white/8 p-4">3. Add the three production environment variables.</li>
            <li className="rounded-xl border border-white/8 p-4">4. Add the production callback URL in Supabase Auth.</li>
            <li className="rounded-xl border border-white/8 p-4">5. Run the production build and smoke-test the golden path.</li>
            <li className="rounded-xl border border-white/8 p-4">6. Keep demo providers visibly labelled until licensed feeds are active.</li>
          </ol>
        </section>
        <aside className="mt-5 flex gap-3 rounded-2xl border border-[#74a7ff]/15 bg-[#74a7ff]/6 p-5 text-sm leading-6 text-white/45"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#9ec2ff]" />This screen and the readiness API expose only boolean activation state—never credentials.</aside>
      </div>
    </main>
  );
}
