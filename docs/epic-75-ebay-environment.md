# Epic 75 — eBay production environment

Add these variables to the Netlify Production environment:

```text
CAPCAR_EBAY_MODE=live
CAPCAR_EBAY_CLIENT_ID=<eBay App ID / Client ID>
CAPCAR_EBAY_CLIENT_SECRET=<eBay Cert ID / Client Secret>
```

Optional, after eBay Partner Network approval:

```text
CAPCAR_EBAY_CAMPAIGN_ID=<numeric campaign ID>
```

Use the eBay **Production** keyset because Capcar connects to `api.ebay.com`. Keep the secret server-only. None of these names use the `NEXT_PUBLIC_` prefix.

After saving the variables, trigger a new Netlify production deployment. Test both `/international-parts` and `/connected-parts`; they now read the same client credential names.
