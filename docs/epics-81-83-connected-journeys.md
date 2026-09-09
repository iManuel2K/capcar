# Epics 81–83 — Connected journeys increment

Built against the available reconstructed source after Epics 78–80, not the latest remote repository.

## Implemented

- 81: Diagnostic records can create persistent checklists from the existing Inspector guidance. Active plans appear in Maintenance. Checklist completion never resolves a DTC automatically. Resolution requires written evidence in the UI; errors are recoverable. Parts, timeline and existing specialist-request links connect the next actions. Timeline subscriptions now include diagnostic and local stamp updates.
- 82: Connected-parts results save directly to the existing vehicle wishlist, with duplicate detection and safe merchant URLs. Existing saved/ordered/delivered tracking is linked. Non-EUR quotes stay in notes rather than becoming incorrect EUR prices. Existing shipping uncertainty and affiliate disclosures remain.
- 83: Published, owned and moderator-review views, condition filtering, empty results, per-listing buyer safety guidance and duplicate-mutation prevention. Existing backend permissions, reports, messages, seller-review and suspension operations remain unchanged.

## Not completed by this increment

Marketplace photo storage/ownership evidence and additional seller verification are not implemented. No platform payments, escrow, guaranteed fraud prevention or new specialist enrolment is provided. Repair photo/invoice attachments and automatic cloud specialist-stamp embedding in the timeline are not provided. Specialist requests remain a separate flow; this package links to them rather than auto-submitting private diagnostics.

## Prerequisites and privacy

Existing community migrations, Supabase authentication/RLS and operator-enrolled specialists/moderators must already be configured. Live eBay requires the Epic 75 environment values and API approval. No new credentials, dependencies or migrations are added.

Repair plans stay in the existing diagnostic storage key and follow Garage synchronization. They are not claims of safe repair. Wishlist saves use existing Garage storage and sync. Before publishing a Passport, review its existing diagnostic disclosure settings. This installer backs up changed files outside the project and stops on newer local edits.

## Owner acceptance

1. Import a scan, create a plan and check a step. Refresh and confirm it remains in Diagnostics and Maintenance, but the fault stays open.
2. Resolve with written evidence and confirm timeline updates; verify cloud sync in a second browser.
3. Save EUR and non-EUR retailer items, repeat a save, then change saved/ordered/delivered status in the wishlist.
4. Test marketplace published/mine/review views with buyer, seller and moderator accounts. Confirm RLS still prevents cross-account edits.
5. Submit a report, moderate a listing, suspend a seller, and request a genuine specialist confirmation.
6. Run Prettier, lint, TypeScript, tests, build and production smoke locally. Tests supplied here were not executed at the owner's request.

This is an incremental implementation across 81–83, not a claim that the full original Epic scope is complete.
