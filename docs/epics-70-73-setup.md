# Capcar Epics 70–73

This package builds on the supplied source through Epics 66–69. It does not prove that later GitHub edits are compatible; the installer stops if an overlapping file differs from its baseline.

## Delivered behavior

| Epic | Implemented                                                                                                                                                                                                                              | Activation or scope limit                                                                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 70   | `/sound-studio`, paired stock/modified local players, exclusive playback, low initial volume, cleanup, input errors and structured public-recording permissions                                                                          | No licensed vehicle recordings are bundled. Personal files stay in the current tab. This is listening comparison, not calibrated loudness measurement.                                                                                                                                        |
| 71   | JSON scan preview, validation, deduplication and atomic import into existing synced diagnostic logs; requests, assigned-specialist attestation and revocation at `/verified-work`                                                        | Normalized Capcar JSON only, not proprietary scanner files, Bluetooth hardware pairing or fault clearing. Database activation and enrolled specialists are required.                                                                                                                          |
| 72   | `/connected-parts` with a real server-side eBay Browse adapter, OAuth client credentials or supplied token, six markets, delivery-country filters, pagination, current response timestamps, original currencies and affiliate disclosure | Production eBay API access is required. No fictional fallback. Existing demo-offer screens remain demos. No integrated checkout, currency conversion or fitment guarantee.                                                                                                                    |
| 73   | `/marketplace` with user listings, mandatory moderation, edit-to-review, withdraw/sold states, private messages/replies, reporting, review evidence, seller review and suspension                                                        | Confirmed accounts, migration and staffed moderation are required. This is a text-listing beta: no photos, escrow, payment processing, automated identity checks or comprehensive fraud guarantee. The UI shows the latest 100 visible listings/messages/requests and up to 100 open reports. |

## Database activation

Install the source changes first. Apply `supabase/migrations/20260909090000_community_and_verified_work.sql` after the earlier migrations in their existing order. It creates RLS-protected tables and write functions, and extends the account erase-data function to include new community records. Account deletion cascades into the new tables. Audit actor identifiers are anonymized when account data is erased; review reasons are retained, so moderators must not put personal contact details in those reasons.

If the Supabase CLI is already authenticated and this local repository is linked to the correct Capcar project:

```powershell
Set-Location "E:\capcar"
pnpm.cmd exec supabase migration list
pnpm.cmd exec supabase db push --dry-run
```

Review the target and pending migrations. Then apply:

```powershell
pnpm.cmd exec supabase db push
```

Alternatively, run the exact migration file in the intended project's Supabase SQL Editor. The installer does not apply remote migrations or alter hosting variables automatically. Never put a service-role key in client code.

## Moderator and specialist enrollment

Only a trusted database operator can enroll roles. Use the actual existing Auth user UUID, not an email or a value supplied by another user. The enrolled user must have confirmed their email.

```sql
-- Replace the UUID and display name before execution.
insert into public.community_roles(user_id, role, display_name)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid, 'moderator', 'Capcar moderation');

-- After verifying the business and the authorized account holder:
insert into public.community_roles(user_id, role, display_name)
values ('REPLACE_WITH_SPECIALIST_UUID'::uuid, 'specialist', 'Reviewed workshop name');
```

Do not enroll users as specialists automatically. Keep the business-identity evidence in your operator records. Users cannot self-enroll, self-publish or self-stamp through the client. A specialist must be different from the vehicle owner and can attest only to a request assigned to that specialist. The vehicle must exist in the owner's cloud snapshot and must not be a demo vehicle.

Moderators review listings from the marketplace using a separate account from the seller. Editing an active listing sends it back to pending. Review evidence is mandatory for publishing, removing listings or granting a reviewed-seller badge. Suspension removes active listings and the seller badge and stops further community activity, apart from withdrawing listings or revoking stamps. The operator handles appeals and reinstatement; there is no automatic unban. Moderators cannot read private messages; users can describe problematic messages in a report on the associated listing while it remains published.

Remove a specialist role to revoke their ability to issue further stamps. Existing records remain identifiable as records from a former specialist; they are not silently promoted to verified records by local storage or client input. These stamps are not automatically added to public Passports in this package.

## Live retailer connection

Set these **server-side** deployment variables:

```text
CAPCAR_EBAY_CLIENT_ID=<production application ID>
CAPCAR_EBAY_CLIENT_SECRET=<production application secret>
CAPCAR_EBAY_CAMPAIGN_ID=<optional approved affiliate campaign ID>
```

The adapter requests an application token using the client-credentials grant. Alternatively `CAPCAR_EBAY_ACCESS_TOKEN` can supply a valid application token; that option requires operator-managed renewal. Without either credential method, the UI reports that retail search is not connected. Failed requests never fall back to demo prices. The current client-credentials implementation requests a token per search; monitor application token quotas during beta and add shared token caching before scaling traffic.

Only eBay is connected by this new adapter. Other retailer adapters still require their own agreements and credentials. All checkout is outbound to the retailer. Affiliate disclosures appear only when the configured campaign produces a validated affiliate URL. Shipping not supplied in the item's currency remains unknown. The displayed timestamp is when Capcar received the response, not a promise of price validity. No photographs or seller reviews are scraped.

References: [eBay Browse API](https://developer.ebay.com/develop/api/buy/browse_api), [eBay authorization](https://developer.ebay.com/develop/guides/sell/authorization), [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Public audio enrollment

The existing `exhaustRecordings` catalogue intentionally remains empty. To add a recording, obtain rights covering the intended public distribution, bundle the allowed audio under `/public/audio`, and add validated vehicle/setup metadata. Required permission fields are `rightsHolder`, `reference`, `reviewedAt` and `publicDistribution: true`, in addition to the existing source and rights description. Do not put private licensing documents into the public catalogue. Stock and modified clips must identify the actual recorded setup; a film clip, exhaust-tip model or unrelated engine is not a substitute.

## Checks performed

- Prettier, ESLint without warnings, strict TypeScript, 137 tests in 59 files, and Next production build passed.
- PostgreSQL execution tests use PGlite with minimal Auth fixtures and the actual migration SQL. They exercise private reads, publication rules, self-escalation denial, specialist ownership, suspension and account-data cleanup. This does not certify deployed Supabase settings.
- Local HTTP checks passed for `/`, `/sound-studio`, `/connected-parts`, `/marketplace` and `/verified-work`. Signed-out `/api/community` returned 401.
- Windows PowerShell execution, real browser audio playback, desktop/mobile visual review, production Supabase migration, real specialist attestations and live eBay calls have not been verified here.

## Release acceptance

Before public use, verify with separate seller, buyer, moderator and specialist accounts: listing review, report handling, private message isolation, seller suspension, real-vehicle stamp request, attestation and revocation. Check the new pages with keyboard navigation and a real phone, play two permission-cleared audio files, and test the offline/error states. Confirm legal/policy coverage and staff the moderation queue before inviting sellers. The UI's bounded latest-record lists suit a small pilot; expand pagination and moderation tooling before a larger rollout.

After deployment:

```powershell
Set-Location "E:\capcar"
pnpm.cmd smoke:production -- https://capcar-im.netlify.app
```

The smoke script now includes all four new public page shells. Database permissions and credential-dependent flows still require the acceptance checks above.
