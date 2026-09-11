# Epic 89 — Live Retail Recovery

## Outcome

Connected Parts no longer fails closed when the optional Supabase shared-budget
function is unavailable. Capcar uses a conservative per-instance allowance and
continues to protect the eBay API instead of returning `503` before contacting
the retailer.

The eBay adapter now prefers renewable application credentials over an optional
static access token and caches the application token until shortly before it
expires. A stale `CAPCAR_EBAY_ACCESS_TOKEN` can therefore no longer override a
valid App ID and Cert ID.

Provider failures are returned as safe, specific messages. The search remains
editable and retryable, and the error card offers a market-specific direct eBay
search so the customer is never left at a dead end. Capcar still never invents
prices or fitment.

## Netlify environment

Keep these server-only variables:

```text
CAPCAR_EBAY_MODE=live
CAPCAR_EBAY_CLIENT_ID=<production App ID>
CAPCAR_EBAY_CLIENT_SECRET=<production Cert ID>
```

`CAPCAR_EBAY_CAMPAIGN_ID` remains optional. Remove
`CAPCAR_EBAY_ACCESS_TOKEN` after this release when the App ID and Cert ID are
configured; it is no longer needed and operator-managed tokens expire.

Do not use a `NEXT_PUBLIC_` prefix for any eBay secret.

## Acceptance

1. Deploy after installing this Epic.
2. Open `/connected-parts` in a private browser window.
3. Search for `2011 e90 rear lights`, market `DE`, delivery `DE`.
4. Confirm either live listings appear or the error identifies the exact eBay
   authorization/access issue and provides **Continue this search on eBay**.
5. If eBay reports that Browse API access was rejected, confirm the Netlify
   values use the eBay **production** keyset and that Buy API access is enabled
   for that application. This entitlement cannot be granted by application
   code.

The Supabase `consume_public_retail_budget` migration is still recommended for
a shared quota across server instances, but it is no longer a single point of
failure for Connected Parts.
