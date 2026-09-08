import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = { title: "Terms and safety" };

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Beta terms and safety"
      title="Plan clearly. Verify before you act."
      description="Capcar organizes project-car information. It does not replace an authoritative repair procedure, inspection or qualified professional. Last updated 8 September 2026."
    >
      <LegalSection title="1. Private beta">
        <p>
          Capcar is a private beta. Features may change, be unavailable or
          contain labelled demonstration data. Catalogue entries, merchant
          offers, visual concepts, compatibility rules, tuning roadmaps and
          installation workflows may be fictional or incomplete unless their
          source and verification state explicitly say otherwise.
        </p>
      </LegalSection>

      <LegalSection title="2. Safety and fitment">
        <p>
          Do not use Capcar as the sole basis for purchasing parts, lifting a
          vehicle, performing safety-critical work, modifying emissions
          equipment or determining road legality. Verify the exact vehicle,
          production date, option codes, part documentation, repair procedure,
          tightening values, fluids and local legal requirements.
        </p>
        <p>
          Stop and use a qualified professional whenever the work exceeds your
          competence, tools or safe working environment.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and records">
        <p>
          Keep your login secure and enter only records you are entitled to
          store. Capcar provides export and deletion controls, but you remain
          responsible for retaining original invoices, workshop documents and
          legally required evidence.
        </p>
      </LegalSection>

      <LegalSection title="4. Public Passport links">
        <p>
          Publishing a Vehicle Passport makes its contents accessible to anyone
          who receives the link. Review the record before publishing and revoke
          or delete the link when it should no longer be available. Public
          passports are owner-entered records, not Capcar certification.
        </p>
      </LegalSection>

      <LegalSection title="5. External websites">
        <p>
          Merchant, source and 3D links lead to independent services with their
          own terms and privacy practices. Confirm price, shipping, returns,
          authenticity, fitment and road approval directly with the relevant
          provider before purchasing.
        </p>
      </LegalSection>

      <LegalSection title="6. Changes and availability">
        <p>
          The operator may update or discontinue beta features to protect users,
          address defects or improve the product. Material changes affecting
          user data or public sharing should be communicated to invited testers.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
