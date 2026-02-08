# Vercel production deployment – SmashD

This app is configured for **Vercel** with **PostgreSQL**. Follow these steps to deploy.

## 1. Database (required)

Vercel serverless does **not** support SQLite. Use a hosted PostgreSQL database:

- **[Vercel Postgres](https://vercel.com/storage/postgres)** (recommended; one-click)
- **[Neon](https://neon.tech)** (free tier, serverless Postgres)
- **[Supabase](https://supabase.com)** (free tier)

Create a project and copy the **connection string** (e.g. `postgresql://...`).

### Apply schema

From your machine (with `DATABASE_URL` set to the new Postgres URL):

```bash
npx prisma migrate deploy
```

Or, for a completely fresh DB, you can use:

```bash
npx prisma db push
```

## 2. Environment variables on Vercel

In **Vercel → Project → Settings → Environment Variables**, set:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
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
- After the first deploy, run `prisma migrate deploy` (or `db push`) once against your production `DATABASE_URL` to create tables.

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

If you use Vercel Postgres, `DATABASE_URL` is set automatically when you link the store to the project. You still need to run `prisma migrate deploy` (or `db push`) once to create the schema.
