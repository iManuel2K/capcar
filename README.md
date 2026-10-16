# CapCar

CapCar is a private digital garage for planning, maintaining, and documenting project cars. It keeps a car's history, build direction, parts research, fitment evidence, costs, and maintenance work in one place.

[Open CapCar](https://capcar.dev)

## What CapCar covers

- A garage for vehicles and project status
- Build plans, budgets, stages, and visual direction
- Parts research with fitment and source evidence
- Maintenance records, diagnostics, and reminders
- A portable vehicle passport and roadbook
- English, German, and Albanian interfaces

CapCar helps organize decisions and evidence. It does not guarantee part fitment or replace professional mechanical advice.

## Technology

- Next.js and React
- TypeScript and Tailwind CSS
- Supabase for data and authentication
- Netlify for deployment
- Vitest and Playwright for automated checks

## Local development

Install Node.js and pnpm, then run:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy the relevant documented templates before starting local development:

- `.env.example`
- `.env.production.example`
- `.env.providers.example`

Keep real credentials in local or hosted environment settings. Never commit secrets.

## Quality checks

Run the complete repository check before opening a pull request:

```bash
pnpm check
```

The command covers formatting, linting, type checks, unit tests, production build validation, browser tests, and secret scanning.

## Deployment

The `master` branch deploys to Netlify. Production is available at [capcar.dev](https://capcar.dev).
