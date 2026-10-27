# Sign-in component

CapCar already supports TypeScript, shadcn, Tailwind CSS 4, `lucide-react` and `tw-animate-css`. No setup or dependency installation is required.

- Shared components: `src/components/ui/` (`@/components/ui`)
- Global styles and palette: `src/app/globals.css`
- shadcn configuration: `components.json`
- Production integration: `src/components/auth/auth-form.tsx`, rendered at `/login`
- Isolated example: `src/components/ui/sign-in.demo.tsx`

The project uses `src/`, so the requested `/components/ui` belongs under `src/components/ui`, rather than a second folder at the repository root. This keeps shadcn generation, TypeScript aliases and shared imports consistent.

```tsx
import { SignInPage, type Testimonial } from "@/components/ui/sign-in";
```

The component uses CapCar's existing font and semantic palette. The sign-in page follows the approved desktop split layout (photo left, form right) and mobile layout (photo header, overlapping rounded form panel). The form panel retains the shared blue-charcoal gradient. The home-linked logo and language picker replace the marketing navigation on `/login`.

The five approved local Unsplash photographs are configured in `src/components/auth/sign-in-photos.ts`. Previous/next controls browse the photographs without resetting the form, and each photograph has its source credit. There is no automatic cycling. See `public/auth/README.md` for source and license records, and `design-system/capcar/pages/auth.md` for the approved layout. The owner's BMW is not used by sign-in or its demo.

The production form retains existing authentication, errors, localized labels and destination handling. Google and remember-me controls render only when their handlers are supplied. The isolated demo only updates a status message; it never logs or sends credentials. Sample customer endorsements are not displayed on the production page.

Custom images must comply with the existing image Content Security Policy. Use local assets or explicitly approved hosts. The component does not broaden the site's policy to load the original demo CDN.
