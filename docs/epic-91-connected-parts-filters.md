# Epic 91 — Connected Parts Filters

Connected Parts now supports compact, responsive retailer refinements:

- condition: any, new, used, or for parts/not working;
- minimum and maximum price;
- best match, lowest price, highest price, or newly listed sorting;
- one-action filter reset.

Filters are validated in the shared request contract and passed to eBay's
Browse API. They reset pagination and participate in request cancellation and
the short client cache. Invalid or inverted price ranges do not contact the
provider and receive an inline accessible explanation.

The direct eBay continuation link preserves the selected market, condition,
price range and result order. Capcar intentionally does not add a
"guaranteed fitment" filter: retailer search refinements cannot establish
vehicle compatibility. Existing fitment guidance remains unchanged.

No new environment variables, dependencies or database migrations are needed.
