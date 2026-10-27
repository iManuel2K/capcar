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

The component uses CapCar's existing font and semantic palette. The sign-in page follows the approved desktop split layout (photo left, form right) and mobile layout (photo header, overlapping rounded form panel). The form panel uses the requested `#f7f5f0` background with scoped light-surface text, input and button roles. The home-linked logo and language picker replace the marketing navigation on `/login`.

The five approved local Unsplash photographs are configured in `src/components/auth/sign-in-photos.ts`. The dynamic login route randomly selects one on the server for each request and passes it to the client, keeping rendering consistent through hydration and form edits. There are no photo controls or automatic cycling. Each photograph has its source credit. The wide Porsche photograph uses contain framing so the whole car fits. See `public/auth/README.md` for source and license records, and `design-system/capcar/pages/auth.md` for the approved layout. The owner's BMW is not used by sign-in or its demo.

The production form retains existing authentication, errors, localized labels and destination handling. Google and remember-me controls render only when their handlers are supplied. The isolated demo only updates a status message; it never logs or sends credentials. Sample customer endorsements are not displayed on the production page.

Custom images must comply with the existing image Content Security Policy. Use local assets or explicitly approved hosts. The component does not broaden the site's policy to load the original demo CDN.
