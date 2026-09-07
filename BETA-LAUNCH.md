# Capcar Beta launch runbook

## Included scope

- Editorial vision, interactive positioning matrix and three-phase roadmap
- Vehicle Passport with print/PDF, public sharing, JSON and CSV export
- Budget and cost analytics for parts, labor and maintenance
- Part wishlist with price targets and Saved, Ordered and Delivered states
- Manual OBD-II/DTC diagnostic history
- Filterable specialist directory and beta install-stamp workflow
- Safe outbound affiliate routing for supported merchant domains
- Capcar Pro feature teasers
- Browser-local fallback plus authenticated Supabase snapshot sync

## 1. Apply the database changes

Open the Supabase SQL editor for the Capcar project and run each migration that has not already been applied, in filename order:

1. `supabase/migrations/20260905130000_create_garage_snapshots.sql`
2. `supabase/migrations/20260907160000_create_vehicle_passports.sql`
3. `supabase/migrations/20260907161000_create_affiliate_clicks.sql`

The garage snapshot migration is already active if account backup and restore currently work. Do not run an already-applied migration a second time. For this epic, the two `20260907...` files are the new migrations.

The public passport policy exposes only records explicitly marked public. Garage snapshots remain owner-only. Affiliate click rows can be inserted publicly but cannot be selected publicly.

## 2. Configure authentication

In Supabase Authentication → URL Configuration:

- Site URL: `https://capcar-im.netlify.app`
- Redirect URL: `https://capcar-im.netlify.app/auth/callback`
- Local redirect URL: `http://localhost:3000/auth/callback`

Keep email confirmation enabled for the beta.

## 3. Configure Netlify

Set the following environment variables for Production:

```text
NEXT_PUBLIC_APP_URL=https://capcar-im.netlify.app
NEXT_PUBLIC_SITE_URL=https://capcar-im.netlify.app
NEXT_PUBLIC_SUPABASE_URL=<public Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<browser-safe publishable key>
```

Never add the Supabase secret key to a `NEXT_PUBLIC_` variable.

## 4. Validate before deployment

```powershell
Set-Location "E:\capcar"
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

## 5. Beta smoke test

Use a private browser window and verify:

1. Register and confirm the sign-in email.
2. Add a vehicle and reload the browser.
3. Add one maintenance record, expense, wishlist item and DTC.
4. Add a beta shop stamp.
5. Open Vehicle Passport and download JSON and CSV.
6. Print the passport to PDF.
7. Publish a passport and open its URL while signed out.
8. Sign in from another browser and confirm garage snapshot restore.
9. Open a supported merchant link and confirm the redirect.
10. Test the landing page and all new screens at 390 px and desktop width.

## Release strategy

### Private beta

- Invite 10–20 owners with different cars.
- Keep retailer, specialist and fitment demo labels visible.
- Ask each tester to complete one real maintenance or build record.
- Collect feedback on time-to-first-vehicle, saved part links, completed records and passport exports.

### Beta expansion gate

Expand only after:

- account creation and restore are reliable;
- no user can read another user’s garage snapshot;
- public passport links expose only the intended record;
- users understand the difference between structured fitment, conditional fitment and unverified data;
- at least five testers return to update the same vehicle record.

### Monetization gate

Affiliate tracking is infrastructure only during beta. Activate commercial campaign IDs only after disclosure text, consent requirements and merchant terms have been reviewed. Capcar Pro remains a teaser until users demonstrate demand for multiple vehicles, automated price monitoring or advanced exports.
