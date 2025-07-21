# Supabase Setup Guide for STACK'D

## 🚀 Quick Setup

### 1. Update Environment Variables

First, run the setup script to configure your environment:

```bash
node setup-supabase-env.js
```

### 2. Update Your Password

Edit `setup-supabase-env.js` and replace `[YOUR-PASSWORD]` with your actual Supabase password:

```javascript
const SUPABASE_CONFIG = {
  host: 'db.bpqodsnljtcmgzlrariu.supabase.co',
  port: '5432',
  database: 'postgres',
  user: 'postgres',
  password: 'your-actual-password-here' // Replace this!
};
```

### 3. Test Connection

```bash
node test-connection.js
```

### 4. Push Schema to Supabase

```bash
npx prisma db push
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed Database (Optional)

```bash
npm run seed
```

## 🔧 Manual Environment Setup

If you prefer to set up manually, create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:your-password@db.bpqodsnljtcmgzlrariu.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string"

# Supabase (for future features)
SUPABASE_URL="https://bpqodsnljtcmgzlrariu.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Environment
NODE_ENV="development"

# SumUp Payment Integration
SUMUP_API_KEY=""
SUMUP_MERCHANT_ID=""
SUMUP_ENVIRONMENT="sandbox"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 📋 Required Information

### From Supabase Dashboard:
1. **Database Password** - Found in Settings > Database
2. **Anon Key** - Found in Settings > API (for future Supabase features)
3. **Project URL** - Already provided: `https://bpqodsnljtcmgzlrariu.supabase.co`

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 🚨 Troubleshooting

### Connection Issues:
1. **DNS Resolution Error**: Check if your Supabase project is active
2. **Authentication Failed**: Verify password is correct
3. **SSL Issues**: Connection string includes SSL configuration
4. **IP Restrictions**: Check Supabase dashboard for IP allowlist

### Common Commands:
```bash
# Reset database (WARNING: This will delete all data)
npx prisma db push --force-reset

# View database in browser
npx prisma studio

# Check connection
npx prisma db pull

# Generate types
npx prisma generate
```

## 🎯 Next Steps

1. ✅ Set up environment variables
2. ✅ Test database connection
3. ✅ Push schema to Supabase
4. ✅ Generate Prisma client
5. 🔄 Deploy to Vercel with new database
6. 🔄 Update Vercel environment variables

## 📞 Support

If you encounter issues:
1. Check Supabase project status
2. Verify connection string format
3. Test with the provided scripts
4. Check IP restrictions in Supabase dashboard 