# Rust N Riches Platform 

A Next.js 14 (App Router) e-commerce store with an admin panel. Customers browse products, fill a cart and check out as guests (Cash on Delivery, prices in PKR). The store owner manages products, stock and incoming orders from `/admin`.

## Features

- **Storefront:** product catalog with search and category filter, cart (saved in the browser), guest checkout, order confirmation page, order tracking by order number + phone, and a contact page.
- **Checkout safety:** prices and stock are always re-checked on the server; stock is decremented atomically so the last units can't be oversold; a honeypot field and a per-IP rate limit slow down bots.
- **Admin:** dashboard (pending orders, revenue, low stock), order management (Pending → Confirmed → Shipped → Delivered, or Cancelled which returns stock), products, categories, stock, and store settings (contact details, delivery charges, free-delivery threshold).

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

   This creates one `Admin` row you can log in with at `/admin/login`. Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` and `SEED_ADMIN_NAME` in `.env` before running the seed to choose your own credentials; if you leave them unset the fallbacks in `prisma/seed.ts` are used (and the seed prints a reminder to change the password).

   To also add a few demo categories and products for local testing, run the seed with `SEED_DEMO=true` (for example `SEED_DEMO=true npm run db:seed`, or `$env:SEED_DEMO="true"; npm run db:seed` in PowerShell).

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
| `SEED_DEMO` | No | Set to `true` to seed demo categories and products with `npm run db:seed`. |

`.env` is git-ignored — never commit real credentials.

## Project Structure

```
app/
  (public)/        Storefront — home, products, product detail, cart, checkout, order confirmation, track order, contact
  (admin)/admin/   Admin panel — dashboard, orders, products, categories, stock, settings
  api/              Route handlers. Public: /api/checkout, /api/cart/refresh. Everything else requires an admin session.
components/
  ui/               shadcn/ui primitives
  admin/            Admin-only composite components (tables, forms, dialogs, widgets)
  public/           Public-site components
lib/                Prisma client, next-auth config, zod schemas, cart context, price/order helpers
prisma/             Schema + seed script
```

## Authentication

Admin routes (`/admin/*`, excluding `/admin/login`) and the admin API routes (`/api/products`, `/api/categories`, `/api/orders`, `/api/settings`) are protected by `middleware.ts`, which redirects unauthenticated requests to the login page. Credentials are checked against the `Admin` table with bcrypt-hashed passwords — see `lib/auth.ts`. Customers do not have accounts; the public checkout endpoints (`/api/checkout`, `/api/cart/refresh`) are deliberately outside the middleware matcher.

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

- Image "uploads" (product photos, store logo) are MVP placeholders: you can paste an image URL, or pick a local file to preview it as a temporary blob URL. Neither is persisted to real storage yet — wiring up something like Vercel Blob or S3 is the natural next step. Until then, paste image URLs for product photos.
- Payment is Cash on Delivery only. `PaymentMethod` is an enum on the `Order` model so an online gateway can be added later.
- The checkout rate limiter (`lib/rate-limit.ts`) is in-memory and per server instance; use a shared store such as Redis if you need hard limits on serverless hosting.
- WhatsApp links (order confirmation, "WhatsApp Customer" in the admin) use plain `wa.me` deep links, with no API integration.
