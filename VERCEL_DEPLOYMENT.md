# Vercel production deployment – SmashD

This app is configured for **Vercel** with **PostgreSQL**. Follow these steps to deploy.

## 1. Database (required)

Vercel serverless does **not** support SQLite. Use a hosted PostgreSQL database:

- **[Vercel Postgres](https://vercel.com/storage/postgres)** (recommended; one-click)
- **[Neon](https://neon.tech)** (free tier, serverless Postgres)
- **[Supabase](https://supabase.com)** (free tier)

Create a project and copy the **connection string** (e.g. `postgresql://...`).

### Supabase connected in Vercel

Vercel adds **`POSTGRES_PRISMA_URL`** when Supabase is linked, but Prisma expects **`DATABASE_URL`**. In Vercel → Settings → Environment Variables, add **`DATABASE_URL`** and set its value to the same as **`POSTGRES_PRISMA_URL`** (copy from the existing variable), then redeploy.

### Apply schema

From your machine, with `DATABASE_URL` in `.env` pointing at your Postgres DB.

**Supabase:** Use the **direct** (non-pooling) URL for migrations/push, or you may see "prepared statement already exists". In `.env` temporarily set:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

(Use port **5432**, not 6543. Same as `POSTGRES_URL_NON_POOLING` in Vercel.) Then run:

```bash
npx prisma db push
```

Then set `DATABASE_URL` back to the **pooled** URL (port 6543) for running the app and on Vercel.

Alternatively: `npx prisma migrate deploy` (also use the direct URL in `.env` when running it).

## 2. Environment variables on Vercel

In **Vercel → Project → Settings → Environment Variables**, set:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL URI (if Supabase linked: copy value from `POSTGRES_PRISMA_URL`) |
| `NEXTAUTH_URL` | Yes (if using auth) | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Yes (if using auth) | e.g. `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | If using Google sign-in | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | If using Google sign-in | From Google Cloud Console |
| `NEXT_PUBLIC_APP_URL` | Recommended | Same as `NEXTAUTH_URL` |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Same as `NEXTAUTH_URL` |
| `UPSTASH_REDIS_REST_URL` | Optional | For order notifications |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | For order notifications |
| SumUp / Stripe vars | Optional | See `env.template` |

Use **Production**, **Preview**, and **Development** as needed (at least set Production).

## 3. Deploy

- Connect the GitHub repo to Vercel (e.g. [madnikhan/smashd](https://github.com/madnikhan/smashd)).
- Vercel will run `prisma generate && next build` from the build script.
- After the first deploy, run `prisma migrate deploy` (or `db push`) once against your production Postgres (set `DATABASE_URL` in `.env` to your Supabase URI) to create tables.

## 4. Post-deploy

- Open the deployed URL and test: menu, order flow, till, driver login (if used).
- If you use **NextAuth**, ensure in Google Cloud Console the redirect URI includes `https://your-app.vercel.app/api/auth/callback/google`.

## Build command

Default (in `package.json`):

```bash
prisma generate && next build
```

No need to run migrations in the Vercel build; run them once from your machine or a CI step after deploy.

## Optional: Vercel Postgres

If you use Supabase linked to Vercel, add `DATABASE_URL` (copy from `POSTGRES_PRISMA_URL`). You still need to run `prisma migrate deploy` (or `db push`) once to create the schema.
