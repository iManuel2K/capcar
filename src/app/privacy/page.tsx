import Link from "next/link";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        The current Capcar prototype stores garage data in your browser. It does
        not send that data to external vehicle, retailer or AI providers while
        demo mode is active.
      </p>
      <p>
        If Supabase sync is activated later, signed-in users can upload one
        account-owned garage snapshot protected by row-level security. Provider
        credentials remain server-side.
      </p>
      <p>
        Before a public launch, replace this prototype notice with a
        jurisdiction-specific privacy policy describing the operator, hosting,
        analytics, retention, processors and user rights.
      </p>
    </LegalPage>
  );
}

function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-16 text-[#f4f5f2]">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#8ab7ff]">
          ← Capcar
        </Link>
        <p className="mt-16 text-xs tracking-[0.14em] text-white/30 uppercase">
          Prototype notice
        </p>
        <h1 className="mt-3 text-5xl font-medium tracking-[-0.05em]">
          {title}
        </h1>
        <div className="mt-10 space-y-6 text-base leading-8 text-white/50">
          {children}
        </div>
      </article>
    </main>
  );
}
