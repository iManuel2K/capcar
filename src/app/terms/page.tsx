import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#0b0e0c] px-5 py-16 text-[#f4f5f2]">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#ff667a]">
          ← Capcar
        </Link>
        <p className="mt-16 text-xs tracking-[0.14em] text-white/30 uppercase">
          Prototype notice
        </p>
        <h1 className="mt-3 text-5xl font-medium tracking-[-0.05em]">
          Terms and safety
        </h1>
        <div className="mt-10 space-y-6 text-base leading-8 text-white/50">
          <p>
            Capcar is currently a demonstration product. Catalogue entries,
            merchant offers, visual concepts, compatibility rules, tuning
            roadmaps and installation workflows may be fictional or incomplete.
          </p>
          <p>
            Do not use this prototype as the sole basis for purchasing parts,
            lifting a vehicle, performing safety-critical work, modifying
            emissions equipment or determining road legality.
          </p>
          <p>
            Always verify the exact vehicle, production date, options,
            authoritative repair procedure, tightening values, fluid
            specification, part documentation and local legal requirements. Stop
            and use a qualified professional when the work exceeds your
            competence or equipment.
          </p>
        </div>
      </article>
    </main>
  );
}
