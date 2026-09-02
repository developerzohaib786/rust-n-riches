# Zain Super Store Platform

A Next.js 14 (App Router) admin + public storefront for managing a kiryana (grocery) store's product catalog and customer khata (credit ledger).

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- shadcn/ui (Radix primitives) + lucide-react
- react-hook-form + zod
- Prisma + PostgreSQL
- next-auth (Credentials provider)
- Recharts

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A PostgreSQL database (e.g. [Neon](https://neon.tech), Supabase, or local Postgres)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env` and fill in the values below (see [Environment Variables](#environment-variables)).

3. Push the Prisma schema to your database:

   ```bash
   npx prisma migrate dev --name init
   ```

   (Use `migrate dev` for a fresh project with migration history. If you're iterating on the schema without needing migration files, `npx prisma db push` also works.)

4. Seed the default admin user:

   ```bash
   npm run db:seed
   ```

   This creates one `Admin` row you can log in with at `/admin/login`. By default:

   - Email: `admin@kiryanakhata.com`
   - Password: `khata@admin123`

   Override these by setting `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` before running the seed. **Change the password after your first login** if you used the default.

5. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the admin panel.

## Environment Variables

Set these in `.env` locally, and in your hosting provider's project settings for deployment.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `NEXTAUTH_SECRET` | Yes | Random secret used to sign session/JWT tokens. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Production only | The canonical URL of your deployment (e.g. `https://yourstore.vercel.app`). Not needed for local dev. |
| `SEED_ADMIN_EMAIL` | No | Overrides the email used by `npm run db:seed`. |
| `SEED_ADMIN_PASSWORD` | No | Overrides the password used by `npm run db:seed`. |
| `SEED_ADMIN_NAME` | No | Overrides the admin's display name used by `npm run db:seed`. |

`.env` is git-ignored — never commit real credentials.

## Project Structure

```
app/
  (public)/        Public storefront — home, product catalog, product detail
  (admin)/admin/   Admin panel — dashboard, products, customers, khata ledger, transactions, settings
  api/              Route handlers (Prisma-backed REST endpoints)
components/
  ui/               shadcn/ui primitives
  admin/            Admin-only composite components (tables, forms, dialogs, widgets)
  public/           Public-site components
lib/                Prisma client, next-auth config, zod schemas, shared utils
prisma/             Schema + seed script
```

## Authentication

Admin routes (`/admin/*`, excluding `/admin/login`) are protected by `middleware.ts`, which redirects unauthenticated requests to the login page. Credentials are checked against the `Admin` table with bcrypt-hashed passwords — see `lib/auth.ts`.

## Deploying to Vercel

This is a standard Next.js app, so Vercel's zero-config Next.js preset handles the build; no `vercel.json` is required.

1. Push the repo to GitHub/GitLab/Bitbucket and import it into Vercel.
2. Add the environment variables from the table above in the Vercel project settings (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` set to your production domain).
3. `package.json` already includes `"postinstall": "prisma generate"`, so the Prisma client is regenerated automatically on every deploy — no extra build command changes needed.
4. Run migrations against your production database before or during your first deploy:

   ```bash
   npx prisma migrate deploy
   ```

   (Run this from your machine with `DATABASE_URL` pointed at production, or wire it into a deploy hook — `migrate deploy` never prompts and is safe for CI/CD.)
5. Seed the production admin user once, the same way as local setup, pointed at the production `DATABASE_URL`.

## Notes

- Image "uploads" (product photos, customer photos, store logo) are MVP placeholders: you can paste an image URL, or pick a local file to preview it as a temporary blob URL. Neither is persisted to real storage yet — wiring up something like Vercel Blob or S3 is the natural next step.
- WhatsApp payment reminders use a `wa.me` deep link (no API integration). See the comment block in `components/admin/PaymentReminderDialog.tsx` for the upgrade path to the WhatsApp Cloud API.
