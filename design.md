# CapCar public editorial design

Scope: public page bodies only. The shared Obsidian Chrome/header/navigation/footer
and practical garage design are owned independently and must not be restyled by this file.
Existing `design-system/capcar/MASTER.md` and its approved product boundaries still apply.

## Genre and structure

Automotive editorial, inspired by the user-supplied YOIN image, not a pixel copy.
Public marketing: Split Studio, alternating explanation and authentic product proof.
Interactive tools: readable, dense workbenches inside the public page, not decorative cards.
Journal: visual index plus cream reading sheets. Garage: unchanged.

## Palette and typography

Source: `tokens.css`, public-prefixed custom properties only.
Deep teal #0b2326; cream #f5f2e8; copper #d6aa92; muted #bdcbc5.
Display uses system serif/Georgia with Japanese Mincho fallbacks, upright, regular weight.
Body and detailed controls retain the current system sans. No new downloaded fonts.
Fluid display sizes, natural wrapping in all five supported languages; no fixed heading heights.

## Spacing, images, interactions

Fluid public gutters 20–64px, major sections 56–128px, compact phone spacing.
Whole-car contain framing, controls outside images, existing comparison slider retained.
Reference models and illustrative costs remain explicitly labeled; never imply verification.
Copper primary CTA, quiet underlined secondary action, native focusable controls.
No scroll hijacking, hidden-on-arrival content or new animation runtime. Reduced-motion
removes nonessential transitions. Do not extend public typography into shared chrome.
