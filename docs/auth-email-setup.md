# Production auth email setup

These templates are for the hosted CapCar Supabase project. Deploying the
website does not update its Auth dashboard.

## Restore the password reset redirect

1. In the [CapCar Auth URL settings](https://supabase.com/dashboard/project/ojbwkjjjlligfdybgqux/auth/url-configuration),
   set **Site URL** to `https://capcar.dev`. Keep unrelated existing redirect
   entries. CapCar's public signup and recovery flows start on this origin.
2. Under **Redirect URLs**, make sure the recovery callback is allowed:
   `https://capcar.dev/auth/callback?next=%2Freset-password`.
   If the Netlify alias is still used intentionally, keep its existing
   callback entries; prefer starting Auth flows on `capcar.dev`.
3. Request a **fresh** link at [Forgot password](https://capcar.dev/forgot-password).
   Open the latest email in the same browser profile that requested it so the
   code verifier is available. The link should go through `/auth/callback`
   and reach `/reset-password`. Existing emails do not change.

## Brand the emails

In **Authentication → Emails → Templates**, paste the HTML from
[recovery.html](../supabase/templates/recovery.html) under Reset Password and
[confirmation.html](../supabase/templates/confirmation.html) under Confirm
Sign Up. Set their subjects to **Reset your CapCar password** and
**Confirm your CapCar email**, respectively. Keep the `{{ .ConfirmationURL }}`
placeholder; Supabase generates a new link for each request.

To change the From identity, connect a verified transactional SMTP sender
under **Authentication → Emails → SMTP Settings**. Suggested identity:
**CapCar <accounts@capcar.dev>**. Verify the domain in the SMTP provider and
add only the DNS records it requests. If using a dedicated sending subdomain,
use a From address on that verified subdomain. Enter credentials directly in
Supabase; keep them out of the repository. Disable email click tracking for
one-time auth links if the provider enables it.

The PNG in the template controls the logo inside the message. The sender
avatar in Gmail is separate: it is chosen by the mail client, and Gmail's
domain branding option is BIMI. Do not promise an inbox avatar until the
sending domain meets the mail client's requirements.

References: [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls),
[custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp),
[email templates](https://supabase.com/docs/guides/auth/auth-email-templates),
[Google BIMI setup](https://support.google.com/a/answer/10911320).
