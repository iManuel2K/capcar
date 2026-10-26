# Unlumen Favicon Search in CapCar

Source: https://ui.unlumen.com/components/favicon-search
Registry: https://ui.unlumen.com/r/favicon-search.json (retrieved 2026-10-26)
Author: Léo / Unlumen UI. License: https://unlumen-ui-docs.vercel.app/docs/license

The free component is adapted inside the CapCar application, not distributed as a UI kit.
Unlumen permits use and modification in commercial applications; its components are not MIT licensed and must not be extracted or redistributed as standalone components.

Installed in the shared parts search and the detailed parts search. Article search is unchanged.
Existing Motion and Lucide dependencies are reused. Adaptations preserve native form submission,
labels, input attributes, composition events and the current parts search behaviour. Clear controls
are translated in all five locales, return focus to the input, and have 48px targets.
Reduced motion disables icon transitions. Failed favicon images fall back to the search icon.

After a 350ms debounce, a valid public HTTP(S) domain uses Google's favicon service. Only the
hostname is sent, never the URL's path, query or fragment; the image sends no referrer. Ordinary
part names, private hostnames, credentials and IP addresses do not trigger favicon requests.
CSP image permissions cover only the favicon endpoint and its gstatic favicon redirect.

A favicon identifies a website. It does not import a listing, validate a seller, establish fitment,
or change the existing search provider. Entered text still follows the existing search pipeline.
