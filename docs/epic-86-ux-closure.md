# Epic 86 — UX closure and trust

Install after Epic 85. This package is based on the source reconstructed in this workspace, not a verified latest GitHub checkout. The installer checks baseline hashes and stops before writing if your local version differs. Keep your local edits and merge a conflict; do not bypass the check.

## Changes

- Public connected-parts searches use a separate database budget, without requiring an account. Private APIs retain their authentication guards.
- Signed-out marketplace visitors can browse the latest 100 published listings. A dedicated SQL projection excludes seller identities, messages, reports and work records. Suspended sellers are excluded. Contact, creation and moderation still require authentication.
- Verified work offers a sign-in explanation before mounting private synchronization tools. Marketplace and verified-work navigation have loading messages.
- Community, sound studio and concept studio share the marketing navigation, including its mobile menu.
- Parts search preserves the submitted query and announces pending navigation. It links to public retailer search.
- Demo builds are explicitly labelled as sample data. Project Streetline replaces the former project name. Roadmap copy distinguishes growing beta coverage from planned replicas and checkout.
- Selected homepage section spacing is reduced. No measured page-length reduction or new UX score is claimed.
- Invalid account forms show an accessible error summary alongside native field validation. A full custom inline validation system is not included.

## Required deployment step

After installing, run `supabase/migrations/20260910090000_public_discovery.sql` in your project's Supabase SQL editor **once, before deploying**. It depends on the existing community migration. The installer does not connect to your database. Never paste service-role keys into client configuration.

The anonymous retailer budget is fixed at 30 searches per minute and 1,200 per rolling day, shared across visitors and server instances. It fails closed if unavailable. Public callers can consume that shared allowance, so this bounds provider usage but does not guarantee availability during abuse. Production edge-level abuse controls and provider quota monitoring remain operational work. No new environment variables are introduced; existing eBay production credentials and API approval are still required. This does not repair missing provider approval or the separate legacy international-search integration.

Listings previously marked published become publicly readable through the explicit projection. Review their titles, descriptions and city fields for unintended personal information before applying the migration. It exposes no extra table permissions and does not change moderation rules.

## Verification and remaining work

The delivery message reports the completed checks. Database regression tests execute the migration in embedded PostgreSQL and check anonymous grants, unpublished and suspended exclusions, and shared budgets. These are not tests against your production Supabase instance.

After deployment: test retailer search signed out, browse a moderated listing, verify sign-in returns to marketplace/verified work, submit an invalid registration, and check header/search/navigation at mobile and desktop sizes. Then run `pnpm.cmd smoke:production -- https://capcar-im.netlify.app`.

The Netlify badge/platform injection setting, real provider connectivity, authenticated workflows, and a fresh live mobile/desktop UX audit remain unverified. No CSS workaround hides platform branding. An above-8/10 experience must be confirmed from the deployed result; it is not guaranteed by passing code checks.
