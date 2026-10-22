# Garage override

Apply the master plus these rules to the garage showroom and public example.

- Keep the showroom container transparent (`rgba(0,0,0,0)`) over the existing dark garage page. Do not restore the cream card or rounded image frame.
- Keep whole-car visuals, small adjacent car choices, direct selection and keyboard/swipe alternatives. Matching 3D models can rotate; keep the preview when 3D fails.
- Keep the compact text selector directly below the main carousel. Avoid a duplicate strip of large car pictures.
- Use the existing local palette: text `var(--foreground)`, secondary text `var(--muted-foreground)`, chrome `var(--primary)`, subtle white borders. Keep the renderer alpha-enabled and controls/credits readable on dark backgrounds.
- Keep the seven-axis radar and account actions below the visual. Do not cover the car with labels, gradients, chart content or control overlays.
- Keep optional carousel play/pause distinct from model rotation. Pause cycling when a user edits ratings, focuses a control or interacts with the selected vehicle.
- Preserve strict vehicle matching, owner uploads, per-car persistence and clearly labeled public examples.

Implementation anchors: `src/components/garage/garage-showroom.tsx`, `garage-showroom.module.css`, `vehicle-radar.tsx`, and the shared `src/components/visualizer/interactive-car-model.tsx`.
