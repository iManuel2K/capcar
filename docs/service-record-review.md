# Service record review

Open a real vehicle in **Garage → Maintenance**. Choose up to three JPG, PNG,
or WebP photos of completed-work records, optionally add a date and odometer
reading from an outside vehicle history report, then confirm the provider
handoff and run the review.

- The browser prepares bounded JPEG copies without the original file metadata.
  CapCar forwards the photos, basic vehicle identification and maintenance
  task labels to the signed-in user’s connected image-capable AI. It does not
  forward the user’s saved maintenance records, outside report reading or stored
  VIN to that provider. Users should redact any private details visible in the
  images themselves. The provider’s charges and retention terms apply.
- CapCar reconciles the extracted evidence against its existing maintenance
  checklist and the car’s recorded work. **Due by plan** uses CapCar’s
  planning intervals, not the manufacturer’s service schedule. **Not
  confirmed** means the submitted evidence does not establish completion.
  Review the source photo before making or recording maintenance decisions.
- The history cross-check compares the supplied dated reading in kilometres
  against compatible readings. It does not download history reports,
  determine accident/title status, certify odometer accuracy or confirm a
  completed service. The app links to the existing official recall references.
- The upload and results are not stored by CapCar, and a review cannot mark
  maintenance complete. Confirmed work may be recorded separately through the
  existing checklist. There is no new database table or deployment secret.

The API uses the existing account/session and request rate-limit guard, and
has no shared-provider fallback. Focused tests cover request validation and
consent, per-account provider routing, maintenance status and mileage
reconciliation, and the panel workflow. Provider test requests are mocked.
