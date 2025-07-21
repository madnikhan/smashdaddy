#!/bin/bash

# Complete Supabase Setup for STACK'D

echo "🚀 STACK'D Supabase Setup Complete Guide"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Your Supabase Connection Details:${NC}"
echo "Host: db.bpqodsnljtcmgzlrariu.supabase.co"
echo "Port: 5432"
echo "Database: postgres"
echo "User: postgres"
echo "Password: [You need to provide this]"
echo ""

echo -e "${YELLOW}🔧 Step 1: Update .env file${NC}"
echo "Edit your .env file and replace the following:"
echo "1. [YOUR-PASSWORD] with your actual Supabase password"
echo "2. your-secure-random-string with: HeZqZi7bLs4sjWV64OCk02wzJ/Sf5SL1TmfcRPzphMs="
echo ""

echo -e "${YELLOW}🔧 Step 2: Test Database Connection${NC}"
echo "Run this command after updating your password:"
echo "node test-connection.js"
echo ""

echo -e "${YELLOW}🔧 Step 3: Push Schema to Supabase${NC}"
echo "Run these commands:"
echo "npx prisma generate"
echo "npx prisma db push"
echo ""

echo -e "${YELLOW}🔧 Step 4: Seed Database${NC}"
echo "Run this command to add sample data:"
echo "npm run seed"
echo ""

echo -e "${YELLOW}🔧 Step 5: Test Locally${NC}"
echo "Start your development server:"
echo "npm run dev"
echo ""

echo -e "${YELLOW}🔧 Step 6: Deploy to Vercel${NC}"
echo "1. Update Vercel environment variables with your Supabase connection"
echo "2. Deploy: vercel --prod"
echo ""

echo -e "${GREEN}✅ Quick Commands Summary:${NC}"
echo "1. nano .env                    # Edit environment variables"
echo "2. node test-connection.js      # Test database connection"
echo "3. npx prisma generate          # Generate Prisma client"
echo "4. npx prisma db push           # Push schema to database"
echo "5. npm run seed                 # Seed with sample data"
echo "6. npm run dev                  # Start development server"
echo ""

echo -e "${RED}⚠️  Important Notes:${NC}"
echo "- Make sure your Supabase project is active"
echo "- Check IP restrictions in Supabase dashboard if connection fails"
echo "- Keep your database password secure"
echo "- Update Vercel environment variables for production"
echo ""

echo -e "${BLUE}📞 Need Help?${NC}"
echo "- Check setup-supabase.md for detailed instructions"
echo "- Run 'node test-connection.js' to diagnose connection issues"
echo "- Visit your Supabase dashboard to verify project status" 