#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 * Run this after setting up your Supabase project
 */

const { PrismaClient } = require('./src/generated/prisma');

async function testSupabaseConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    const restaurantCount = await prisma.restaurant.count();
    console.log(`🏪 Restaurants in database: ${restaurantCount}`);
    
    const menuItemCount = await prisma.menuItem.count();
    console.log(`🍔 Menu items in database: ${menuItemCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`📂 Categories in database: ${categoryCount}`);
    
    if (menuItemCount === 0) {
      console.log('\n⚠️  No menu items found! You need to seed the database.');
      console.log('   Visit: http://localhost:3000/api/seed');
    } else {
      console.log('\n🎉 Database is ready! Your cart should work now.');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Verify the password is correct');
    console.log('4. Check if your IP is allowed (Supabase restrictions)');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSupabaseConnection(); 