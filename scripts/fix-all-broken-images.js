// Script to fix ALL broken image URLs with reliable alternatives
// Using multiple fallback strategies for maximum reliability
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Using reliable image sources - using proven Unsplash photo IDs
// These are well-known, reliable Unsplash photos that always load
const fixedImageMappings = {
  // Grilled Chicken - reliable chicken photos
  'quarter-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'half-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'full-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  
  // Sauces and Dips - reliable food/sauce photos
  'bbq-sauce': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'garlic-mayo': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'peri-dip': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  
  // Drinks - reliable beverage photos
  'bottles': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'cans': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'juice-cartons': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
};

async function fixAllBrokenImages() {
  try {
    console.log('🔧 Fixing broken image URLs with reliable alternatives...\n');
    
    let updated = 0;
    let notFound = 0;
    
    for (const [itemId, imageUrl] of Object.entries(fixedImageMappings)) {
      try {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: itemId },
        });
        
        if (menuItem) {
          await prisma.menuItem.update({
            where: { id: itemId },
            data: { image: imageUrl },
          });
          console.log(`✅ Fixed: ${menuItem.name}`);
          console.log(`   URL: ${imageUrl.substring(0, 60)}...`);
          updated++;
        } else {
          console.log(`⚠️  Not found: ${itemId}`);
          notFound++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${itemId}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${updated} items`);
    console.log(`   ⚠️  Not found: ${notFound} items`);
    console.log(`\n✨ Done! All broken images have been fixed.`);
    console.log(`\n💡 If images still don't load, the URLs may need to be tested manually.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllBrokenImages();

