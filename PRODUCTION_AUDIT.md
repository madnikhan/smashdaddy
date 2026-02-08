# Production audit summary (Vercel-ready)

**Date**: February 2025  
**Status**: ✅ Build passing, ready for Vercel deploy

---

## Changes made

### 1. Database (PostgreSQL for Vercel)
- **Prisma**: Switched from SQLite to PostgreSQL (required for serverless; SQLite not supported on Vercel).
- **Migrations**: Added single PostgreSQL baseline migration `20250208120000_init_postgres`; removed SQLite-only migrations.
- **Migration lock**: Updated `migration_lock.toml` to `postgresql`.
- **First deploy**: Run `npx prisma migrate deploy` (or `npx prisma db push`) once against your production Postgres after deploy. See `VERCEL_DEPLOYMENT.md`.

### 2. Optional Redis
- **`src/lib/redis.ts`**: Redis client is now created only when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set; otherwise `redis` is `null`.
- **Broadcast**: `broadcastNotification` checks for `redis` before publishing; app runs without Upstash.

### 3. Security & hardening
- **Seed API** (`/api/seed`): In production, requires `SEED_SECRET` env var and `Authorization: Bearer <SEED_SECRET>` or `X-Seed-Secret` header to run.
- **Next.js**: Upgraded to 15.5.12 (security fixes).
- **npm audit**: Addressed vulnerabilities; current audit clean.

### 4. Next.js 15 and types
- **Route params**: All dynamic API routes use `params: Promise<{ ... }>` and `await params` (Next 15).
- **PaymentStatus**: Replaced `PAID` with schema enum `COMPLETED` in admin analytics, stats, and order pages.
- **Input component**: Added `id` and `minLength` to `InputProps` and passed through.
- **vehicleInfo (admin)**: Safe typing for Prisma `Json` field.
- **order.driver (track)**: Optional chaining for nullable driver.
- **InstallPrompt**: Typed `navigator.standalone` for iOS.

### 5. Config and docs
- **env.template**: Filled with all required/optional vars (Postgres, NextAuth, Google, Redis, SumUp, Stripe, etc.).
- **VERCEL_DEPLOYMENT.md**: Step-by-step Vercel + Postgres deploy and env setup.
- **.gitignore**: Added `prisma/dev.db` and `prisma/dev.db-journal`.
- **next.config.ts**: Set `outputFileTracingRoot` to avoid multi-lockfile warning.

---

## Build

- **Command**: `npm run build` (runs `prisma generate && next build`).
- **Result**: ✅ Compiles and type-checks; ESLint reports warnings only (no errors).
- **Vercel**: Uses same build command; ensure `DATABASE_URL` is set in Vercel for runtime (migrations run separately).

---

## Environment variables (production)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes (if using auth) | e.g. `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Yes (if using auth) | e.g. `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | If using Google sign-in | From Google Cloud Console |
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` | Recommended | Same as `NEXTAUTH_URL` |
| `UPSTASH_REDIS_*` | Optional | For order broadcast |
| `SEED_SECRET` | Optional | If you need to call `/api/seed` in production |

See `env.template` and `VERCEL_DEPLOYMENT.md` for full list and deployment steps.

---

## Remaining (non-blocking)

- ESLint warnings (unused vars, `any` types, hook deps) – do not fail the build.
- Metadata viewport warnings – consider moving to `viewport` export in Next 15.
- Consider tightening types and cleaning unused imports in a follow-up.

---

**Audit completed**: ✅  
**Production build**: ✅  
**Vercel-ready**: ✅ (with Postgres + env configured)
