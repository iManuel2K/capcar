import Link from "next/link";

import { CapcarWordmark } from "@/components/brand/capcar-wordmark";

export function LegalShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#e8e6d7] px-4 py-5 text-[#0e2d30] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-5">
          <Link href="/" aria-label="Capcar home">
            <CapcarWordmark glow={false} />
          </Link>
          <Link href="/" className="text-sm font-medium text-[#0e2d30]/60">
            Back to Capcar →
          </Link>
        </header>

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

        <article className="mx-auto max-w-3xl py-14 sm:py-20">
          <div className="space-y-10 text-sm leading-7 text-[#0e2d30]/68 sm:text-base">
            {children}
          </div>
        </article>

        <footer className="flex flex-col gap-5 border-t border-[#0e2d30]/10 py-10 text-xs text-[#0e2d30]/48 sm:flex-row sm:items-center sm:justify-between">
          <span>Capcar private beta</span>
          <nav aria-label="Legal navigation" className="flex flex-wrap gap-5">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/imprint">Imprint</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#0e2d30]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
