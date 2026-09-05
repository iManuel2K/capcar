# Capcar provider integration

Epics 11–13 and 21–24 use four independent server-side provider contracts:

| Domain           | Default               | Future example                        |
| ---------------- | --------------------- | ------------------------------------- |
| Vehicle identity | Capcar demo resolver  | Licensed VIN or vehicle-data provider |
| Parts catalogue  | Capcar demo catalogue | TecDoc adapter                        |
| Retail offers    | Capcar demo offers    | eBay or retailer-feed adapter         |
| Vehicle 3D model | Reference geometry    | Licensed, verified mesh library       |

The browser calls only Capcar API routes. Provider API keys remain server-side.

## Why adapter endpoints are used

TecDoc, eBay and VIN providers have different authentication and response formats. Capcar therefore expects a normalized adapter response instead of assuming one provider's proprietary format throughout the application. Later adapters translate provider-specific responses into the stable Capcar contracts.

## Activation

Copy the relevant variables from `.env.providers.example` to `.env.local`, provide an adapter endpoint and secret, then change only that domain's mode to `external`.

An external provider is rejected when either its endpoint or API key is absent. Capcar does not silently fall back to demo data after external mode is selected.

## Routes

- `POST /api/vehicle-data/resolve`
- `POST /api/catalog/search`
- `POST /api/offers/search`
- `GET /api/providers/status`
- `POST /api/visualizer/model`

External responses are runtime-validated before reaching the UI. Invalid provider data returns an error instead of being treated as trustworthy fitment or pricing information.

## Current limitations

- Demo vehicle resolution normalizes the browser profile; it is not a VIN decode. The expanded contract can retain build date, type code, market, drivetrain fields, paint, option codes and field-level provenance when a licensed provider is connected.
- Demo parts, identifiers and fitment rules are fictional.
- Demo merchant offers and prices are fictional. The external contract includes quantity, destination, currency, stock, taxes, price timestamp, shipping, required extras, estimated fees and an HTTPS merchant handoff.
- Reference 3D geometry uses millimetre scene units and interactive projection, but its body surface is conceptual. Only an external asset marked `dimensionally-verified` may receive that accuracy label.
- Activating TecDoc or eBay still requires an account, licensing approval and a provider-specific mapping adapter.
