import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { getLegalConfiguration } from "@/features/legal/legal-config";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  const legal = getLegalConfiguration();

  return (
    <LegalShell
      eyebrow="Privacy notice · Private beta"
      title="Your garage data stays under your control."
      description="This notice explains what the Capcar beta stores, why it is needed and how you can remove it. Last updated 8 September 2026."
    >
      {!legal.complete && (
        <p className="rounded-2xl border border-[#6d0101]/15 bg-[#6d0101]/6 p-5 text-[#6d0101]">
          Public launch is blocked until the operator, address and privacy
          contact are configured. Invite-only testers should use the contact
          details supplied with their invitation.
        </p>
      )}

      <LegalSection title="1. Responsible operator">
        <p>
          {legal.operator || "Operator details pending"}
          <br />
          {legal.address || "Address pending"}
          <br />
          Privacy contact: {legal.privacyContact || "Contact pending"}
        </p>
      </LegalSection>

      <LegalSection title="2. Data Capcar processes">
        <p>
          Capcar stores account details supplied through Supabase authentication
          and the garage records you create, including vehicle details,
          maintenance, builds, costs, wishlists, diagnostics, guide progress and
          visualizer settings. A complete garage snapshot is also kept in
          browser storage for responsive offline-tolerant use.
        </p>
        <p>
          When you publish a Vehicle Passport, the selected passport record is
          available to anyone with its unguessable link until you revoke or
          delete it. Only the final five VIN characters can appear in a shared
          passport.
        </p>
      </LegalSection>

      <LegalSection title="3. Purpose and legal basis">
        <p>
          Account, synchronization and export processing is necessary to provide
          the beta service you request. Security, abuse prevention and short
          rate-limit records support Capcar&apos;s legitimate interest in
          operating a reliable private beta. Capcar does not sell garage data.
        </p>
      </LegalSection>

      <LegalSection title="4. Hosting and external services">
        <p>
          Netlify delivers the application and Supabase provides authentication
          and database storage. Opening an interactive 3D view connects your
          browser to Sketchfab. Vehicle, retailer and AI provider adapters
          remain in labelled demo mode unless the System page reports an
          activated external provider.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention and deletion">
        <p>
          Garage snapshots and private records remain until you delete the
          garage or account. Shared Passport records remain until revoked or
          deleted. Per-user API rate-limit state is replaced as new request
          windows begin. Account controls let you export, delete cloud garage
          data or permanently delete the account.
        </p>
      </LegalSection>

      <LegalSection title="6. Your choices and rights">
        <p>
          You can export the complete garage as JSON or CSV, correct records in
          the garage, revoke public links and delete stored data from Account.
          Depending on applicable law, you may also request access,
          rectification, erasure, restriction, portability or object to certain
          processing through the privacy contact above.
        </p>
      </LegalSection>

      <LegalSection title="7. Beta limitations">
        <p>
          This notice is a product-level baseline, not a substitute for review
          against the operator&apos;s final business structure, contracts and
          deployment configuration. It must be reviewed before a public launch
          or activation of analytics, advertising or new external providers.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
