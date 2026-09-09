# Epic 74 — Native beta feedback

Epic 74 makes the beta workflows self-contained and removes the need for video tutorials or manual third-party setup guides.

## What ships

- Flexible local OBD-II parsing for Capcar JSON, generic JSON, CSV, plain text, ELM327 logs and BimmerLink exports.
- A native Diagnostic AI / Inspector drawer with reviewed DTC guidance, severity, symptoms, likely causes, safe next checks and catalogue searches.
- Reusable button-led drag-and-drop upload controls for OBD and local audio files.
- Sketchfab timeout, blocked-request and extension-disconnect handling with a static Capcar vehicle preview and an in-app retry path.
- Compact Studio view controls over the 3D reference canvas.
- Public `/parts-search` with name, part-number, chassis and engine cross-reference search; no account or vehicle is required.
- A print/PDF Vehicle Passport document with vehicle photo, optional full VIN, mileage, TÜV date, insurance details, explicitly consented owner details and an SVG QR code for a live public Passport.
- Sticky active-vehicle tools for diagnostics, Passport, fitment and maintenance.
- A touch-swipeable Garage vehicle reel, desktop controls and reduced-motion-safe transitions.

## Privacy and safety

Passport owner data remains local until the owner both enables **Publish owner details** and creates a public link. Full VIN is controlled separately. Public links remain revocable and deletable through the existing Passport controls.

Diagnostic guidance is deterministic and reviewed rather than generated from an open-ended model. It is a starting point, not a confirmed diagnosis. Capcar does not clear faults, and safety-critical warnings still direct the owner to qualified inspection.

The public parts search uses the in-app catalogue and does not expose retailer credentials. Live retailer integrations remain protected behind the signed-in Garage workflow.

## Activation

No new database migration or secret is required. The package adds the locked `qrcode.react` dependency for print-safe SVG QR output. After installation, deploy the resulting commit through the existing Netlify workflow and run the production smoke test.
