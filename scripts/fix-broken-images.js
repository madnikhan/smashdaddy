// Script to fix broken image URLs with working alternatives
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Updated image mappings with working URLs
// Using reliable Unsplash photo IDs that are known to work
const fixedImageMappings = {
  // Grilled Chicken - using reliable chicken photos
  'quarter-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  'half-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  'full-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  
  // Vegetarian Burgers - using reliable veggie burger photos
  'meat-free-classic': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop',
  'veggie-patty': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop',
  
  // Sides - using reliable food photos
  'coleslaw': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  'garlic-mayo': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?w=800&h=600&fit=crop',
  'peri-dip': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?w=800&h=600&fit=crop',
};

async function fixBrokenImages() {
  try {
    console.log('🔧 Fixing broken image URLs...\n');
    
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
    console.log(`\n✨ Done! Broken images have been fixed.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenImages();

