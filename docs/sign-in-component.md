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

The supplied component is adapted to use CapCar's existing font and semantic palette. Its page gradient mixes `background`, `secondary` and `primary`; images use contain framing, and testimonials sit below the image. Entrance animations run only when reduced motion is not requested.

The production form retains existing authentication, errors, localized labels and destination handling. Google and remember-me controls render only when their handlers are supplied. The isolated demo only updates a status message; it never logs or sends credentials. Sample customer endorsements are not displayed on the production page.

Custom images must comply with the existing image Content Security Policy. Use local assets or explicitly approved hosts. The component does not broaden the site's policy to load the original demo CDN.
