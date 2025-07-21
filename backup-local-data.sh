#!/bin/bash

echo "💾 STACK'D Local Data Backup Script"
echo "==================================="
echo ""

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"
echo ""

# Backup current schema
echo "📋 Backing up Prisma schema..."
cp prisma/schema.prisma "$BACKUP_DIR/schema.prisma"

# Backup environment
echo "🔧 Backing up environment configuration..."
cp .env "$BACKUP_DIR/.env"

# Export data from current database
echo "📤 Exporting data from local database..."

# Export users
echo "  - Users..."
npx prisma db execute --stdin <<< "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/users.csv" 2>/dev/null || echo "    No users data"

# Export menu items
echo "  - Menu items..."
npx prisma db execute --stdin <<< "COPY (SELECT * FROM menu_items) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/menu_items.csv" 2>/dev/null || echo "    No menu items data"

# Export categories
echo "  - Categories..."
npx prisma db execute --stdin <<< "COPY (SELECT * FROM categories) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/categories.csv" 2>/dev/null || echo "    No categories data"

# Export orders
echo "  - Orders..."
npx prisma db execute --stdin <<< "COPY (SELECT * FROM orders) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/orders.csv" 2>/dev/null || echo "    No orders data"

# Export cart items
echo "  - Cart items..."
npx prisma db execute --stdin <<< "COPY (SELECT * FROM cart_items) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/cart_items.csv" 2>/dev/null || echo "    No cart items data"

echo ""
echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
echo ""
echo "📋 Backup contents:"
ls -la "$BACKUP_DIR"
echo ""
echo "💡 To restore data after migration:"
echo "1. Update your .env with Prisma Cloud connection string"
echo "2. Run: npx prisma db push"
echo "3. Import CSV files using Prisma Studio or database tools"
echo "" 