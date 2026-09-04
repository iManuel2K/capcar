# Capcar architecture

Capcar begins as a modular monolith. PostgreSQL is the source of truth and the
Next.js application owns the user-facing web experience.

## Principles

- Server Components are the default.
- Client Components are introduced only for browser interaction.
- Server Actions handle web mutations.
- Zod validates untrusted input at system boundaries.
- Supabase row-level security remains the authorization boundary.
- Code and database names are English.
- User interfaces support German and English.
- Automotive safety data must be verified and source-labelled.

## Feature boundaries

```text
src/
  app/                  Routing and composition
  components/           Shared visual components
  features/             Business capabilities
    auth/
    vehicles/
    garage/
    maintenance/
    builds/
    parts/
    offers/
    guides/
    timeline/
  lib/                  Infrastructure and shared helpers
  test/                 Shared test setup
```

Features may depend on `lib` and shared components. A feature should not reach
into another feature's internal files. Cross-feature behavior is coordinated by
application-level services or Server Actions.

## Data safety

- Fitment must never be inferred from free-form AI output.
- Legal documentation must carry a source and verification state.
- Torque values, fluid specifications and safety procedures require verified
  structured sources.
- Public catalogue data and private garage data use separate access policies.

