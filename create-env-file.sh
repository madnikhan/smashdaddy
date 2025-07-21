#!/bin/bash

# Create .env file for STACK'D Supabase setup

echo "🔧 Creating .env file for STACK'D..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.bpqodsnljtcmgzlrariu.supabase.co:5432/postgres"

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
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and replace [YOUR-PASSWORD] with your actual Supabase password"
echo "2. Generate a secure NEXTAUTH_SECRET: openssl rand -base64 32"
echo "3. Get your Supabase anon key from the dashboard"
echo "4. Test connection: node test-connection.js"
echo ""
echo "🔍 To edit the file:"
echo "   nano .env"
echo "   # or"
echo "   code .env" 