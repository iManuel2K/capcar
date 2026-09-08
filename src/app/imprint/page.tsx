import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { getLegalConfiguration } from "@/features/legal/legal-config";

export const metadata: Metadata = { title: "Imprint" };

export default function ImprintPage() {
  const legal = getLegalConfiguration();

  return (
    <LegalShell
      eyebrow="Operator information"
      title="Imprint."
      description="Public operator and contact information for Capcar."
    >
      <LegalSection title="Service provider">
        <p>
          {legal.operator || "Operator details pending"}
          <br />
          {legal.address || "Address pending"}
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>{legal.privacyContact || "Contact details pending"}</p>
      </LegalSection>
      {!legal.complete && (
        <p className="rounded-2xl border border-[#6d0101]/15 bg-[#6d0101]/6 p-5 text-[#6d0101]">
          This deployment is not cleared for public launch. Configure all legal
          identity variables first.
        </p>
      )}
    </LegalShell>
  );
}
