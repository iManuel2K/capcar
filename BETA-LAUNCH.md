# Capcar Beta launch runbook

## Included scope

- Conflict-aware, event-driven Supabase garage synchronization
- Vehicle Passport export, print/PDF and revocable public sharing
- Budget, cost, wishlist, maintenance and diagnostic records
- Filterable specialist directory and beta install-stamp workflow
- Authenticated and rate-limited product APIs
- Account data export, cloud-data deletion and account deletion
- Public privacy, terms and imprint routes backed by deployment configuration
- Restricted service-worker caching, security headers, health checks and release smoke tests

## 1. Apply the database changes

Open the Supabase SQL editor for the Capcar project and apply every migration that has not already been recorded, in filename order:

1. `supabase/migrations/20260905130000_create_garage_snapshots.sql`
2. `supabase/migrations/20260907160000_create_vehicle_passports.sql`
3. `supabase/migrations/20260907161000_create_affiliate_clicks.sql`
4. `supabase/migrations/20260908140000_add_beta_api_rate_limits.sql`
5. `supabase/migrations/20260908141000_add_account_data_lifecycle.sql`

Use the Supabase migration workflow or SQL editor for the target project. Do not paste service-role or database credentials into the browser application. The final two migrations add per-user API protection and authenticated account-deletion functions.

## 2. Configure authentication

In Supabase Authentication → URL Configuration:

- Site URL: `https://capcar-im.netlify.app`
- Redirect URL: `https://capcar-im.netlify.app/auth/callback`
- Local redirect URL: `http://localhost:3000/auth/callback`

Keep email confirmation enabled for the beta. Test registration, callback handling, password reset and sign-out with a new address before inviting testers.

## 3. Configure Netlify

Set these Production environment variables:

```text
NEXT_PUBLIC_APP_URL=https://capcar-im.netlify.app
NEXT_PUBLIC_SITE_URL=https://capcar-im.netlify.app
NEXT_PUBLIC_DEPLOYMENT_ENV=production
NEXT_PUBLIC_SUPABASE_URL=<public Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<browser-safe publishable key>
NEXT_PUBLIC_LEGAL_OPERATOR=<legal operator name>
NEXT_PUBLIC_LEGAL_ADDRESS=<service/postal address>
NEXT_PUBLIC_PRIVACY_CONTACT=<privacy email address>
CAPCAR_EBAY_MODE=live
CAPCAR_EBAY_CLIENT_ID=<eBay App ID>
CAPCAR_EBAY_CLIENT_SECRET=<eBay Cert ID>
CAPCAR_EBAY_CAMPAIGN_ID=<optional numeric campaign ID>
```

Add provider variables only for integrations you activate. Never add a Supabase secret or service-role key to a `NEXT_PUBLIC_` variable or commit it to the repository.

Before deploying, run the environment-only production gate in a shell where the Netlify values are available:

```powershell
pnpm.cmd preflight:production
```

The gate validates required legal and Supabase configuration, HTTPS URLs, live eBay credentials, numeric campaign IDs and accidental `NEXT_PUBLIC_` secret names. It reports variable names only, never their values.

## 4. Validate before deployment

```powershell
Set-Location "E:\capcar"
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

## 5. Deploy and run the automated smoke test

After Netlify reports a successful production deploy:

```powershell
Set-Location "E:\capcar"
pnpm.cmd smoke:production -- https://capcar-im.netlify.app
```

This checks public pages, security headers, health status, provider-status redaction, missing Passport handling and the signed-out garage redirect.

## 6. Manual beta acceptance

Use two accounts and a private browser window:

1. Register, confirm email, reset the password and sign back in.
2. Add a vehicle plus maintenance, expense, wishlist and diagnostic records.
3. Go offline, edit a record, reconnect and confirm the sync state returns to **Garage synced**.
4. Sign in as the same user on another browser and verify the cloud garage appears.
5. Create different changes on both browsers and confirm Capcar asks which garage version to keep.
6. Publish a Vehicle Passport, open it signed out, revoke it and confirm its URL returns 404.
7. Export account data and validate that malformed restore data is rejected without replacing the garage.
8. With a disposable account, test **Delete cloud garage data**, then test **Delete account**.
9. Confirm account A cannot query account B's snapshot or private Passport through the Supabase client.
10. Test the landing page, navigation and primary flows at 390 px and desktop width using keyboard-only navigation.
11. Upload noisy ELM327 text, CSV, JSON and BimmerLink samples; confirm the Inspector extracts only valid DTCs and nothing is stored before approval.
12. Search for a part without signing in, then verify the live result label, destination, shipping uncertainty and outbound affiliate disclosure.
13. Block Sketchfab with a privacy extension and confirm the static preview, explanation and retry action remain usable.
14. Print a public Passport to A4/PDF and confirm the photo, QR code, identity, inspection and insurance blocks do not clip or expose hidden Garage data.
15. Navigate the active vehicle tools and collection reel at 390 px using touch, keyboard and reduced-motion mode.

Record every acceptance result as **pass**, **blocked by configuration**, or **product defect**. Configuration blockers must not be disguised with demo results on a feature labelled live.

## Release strategy

### Private beta

- Invite 10–20 owners with different cars.
- Keep retailer, specialist, fitment and provider demo labels visible.
- Ask each tester to complete one real maintenance or build record.
- Monitor `/health`, Netlify function errors, Supabase authentication failures and rate-limit responses.
- Collect feedback on first-vehicle completion, sync trust, saved parts and Passport sharing.

### Beta expansion gate

Expand only after:

- the production smoke test and manual two-account isolation test pass;
- account creation, restore, deletion and garage conflict handling are reliable;
- public Passport links expose only the intended record and revoke immediately;
- users understand structured, conditional and unverified fitment data;
- legal operator details and privacy contact are real and counsel has reviewed the notices;
- at least five testers return to update the same vehicle record.

### Monetization gate

Affiliate tracking remains beta infrastructure. Activate commercial campaign IDs only after disclosure text, consent requirements and merchant terms are reviewed. Capcar Pro remains a teaser until users demonstrate demand for multiple vehicles, automated price monitoring or advanced exports.
