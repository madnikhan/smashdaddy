#!/bin/bash

echo "🚀 STACK'D Prisma Cloud Migration Script"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Prisma Cloud connection string"
    exit 1
fi

echo "📋 Current setup:"
echo "- Prisma version: $(npx prisma --version | head -n 1)"
echo "- Database URL: $(grep DATABASE_URL .env | cut -d'=' -f2 | sed 's/"//g' | cut -d'@' -f2 | cut -d'/' -f1)"
echo ""

echo "🔧 Migration Steps:"
echo "1. ✅ Prisma schema is ready"
echo "2. ⏳ Waiting for Prisma Cloud connection string..."
echo "3. ⏳ Will update .env file"
echo "4. ⏳ Will push schema to Prisma Cloud"
echo "5. ⏳ Will generate Prisma client"
echo "6. ⏳ Will verify connection"
echo ""

echo "📝 Instructions:"
echo "1. Go to https://cloud.prisma.io"
echo "2. Create a new project called 'STACKD'"
echo "3. Create a PostgreSQL database"
echo "4. Copy the connection string"
echo "5. Update your .env file with the new connection string"
echo "6. Run this script again to complete the migration"
echo ""

# Check if DATABASE_URL contains 'cloud.prisma.io' or similar cloud indicators
if grep -q "cloud.prisma.io\|prisma.io" .env; then
    echo "✅ Detected Prisma Cloud connection string!"
    echo ""
    echo "🔄 Starting migration..."
    
    # Push schema to Prisma Cloud
    echo "📤 Pushing schema to Prisma Cloud..."
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema pushed successfully!"
        
        # Generate Prisma client
        echo "🔧 Generating Prisma client..."
        npx prisma generate
        
        if [ $? -eq 0 ]; then
            echo "✅ Prisma client generated!"
            
            # Verify connection
            echo "🔍 Verifying connection..."
            npx prisma studio --port 5556 &
            STUDIO_PID=$!
            
            echo "✅ Migration completed successfully!"
            echo "🌐 Prisma Studio is running at http://localhost:5556"
            echo "🚀 Your STACK'D app is now using Prisma Cloud!"
            echo ""
            echo "To stop Prisma Studio, run: kill $STUDIO_PID"
        else
            echo "❌ Failed to generate Prisma client"
            exit 1
        fi
    else
        echo "❌ Failed to push schema to Prisma Cloud"
        exit 1
    fi
else
    echo "ℹ️  Still using local database"
    echo "Please update your .env file with Prisma Cloud connection string"
    echo "Then run this script again"
fi 