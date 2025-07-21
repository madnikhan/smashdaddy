# Prisma Cloud Migration Guide

## Step 1: Create Prisma Cloud Account

1. Go to https://cloud.prisma.io
2. Sign up or login to your account
3. Create a new project called "STACKD"

## Step 2: Create Database in Prisma Cloud

1. In your Prisma Cloud project:
   - Click "Create Database"
   - Choose **PostgreSQL**
   - Select a region (choose closest to your users)
   - Choose a plan (start with free tier)
   - Give it a name like "stackd-production"

## Step 3: Get Connection String

1. Once your database is created, click on it
2. Go to "Settings" → "Connection strings"
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@host:port/database?schema=public&connection_limit=1
   ```

## Step 4: Update Environment Variables

Update your `.env` file with the new connection string:

```env
# Prisma Cloud Database URL
DATABASE_URL="postgresql://username:password@host:port/database?schema=public&connection_limit=1"

# Environment
NODE_ENV="development"

# SumUp Payment Integration
SUMUP_API_KEY=""
SUMUP_MERCHANT_ID=""
SUMUP_ENVIRONMENT="sandbox"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Step 5: Push Schema to Prisma Cloud

```bash
npx prisma db push
```

## Step 6: Generate Prisma Client

```bash
npx prisma generate
```

## Step 7: Verify Connection

```bash
npx prisma studio
```

## Benefits of Prisma Cloud

✅ **Team Collaboration**: Share database with team members
✅ **Production Ready**: Scalable, managed PostgreSQL
✅ **Backups**: Automatic database backups
✅ **Monitoring**: Database performance monitoring
✅ **Security**: Enterprise-grade security
✅ **Migrations**: Easy schema migrations across environments

## Environment Setup

### Development
- Use Prisma Cloud database
- Local development with cloud database

### Production
- Same Prisma Cloud database
- Deploy to Vercel/Netlify with environment variables

## Next Steps

1. Complete the Prisma Cloud setup
2. Update your `.env` file with the connection string
3. Run `npx prisma db push` to sync your schema
4. Test the application with the cloud database
5. Deploy to production with the same database 