// Final script to fix broken images using reliable food image URLs
// Using Lorem Picsum with food-related seeds for guaranteed reliability
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Using Lorem Picsum - a reliable placeholder service that always works
// Format: https://picsum.photos/seed/{seed}/800/600
const fixedImageMappings = {
  // Grilled Chicken
  'quarter-chicken': 'https://picsum.photos/seed/grilled-chicken-1/800/600',
  'half-chicken': 'https://picsum.photos/seed/grilled-chicken-2/800/600',
  'full-chicken': 'https://picsum.photos/seed/grilled-chicken-3/800/600',
  
  // Sauces and Dips
  'bbq-sauce': 'https://picsum.photos/seed/bbq-sauce/800/600',
  'garlic-mayo': 'https://picsum.photos/seed/garlic-mayo/800/600',
  'peri-dip': 'https://picsum.photos/seed/peri-dip/800/600',
  
  // Drinks
  'bottles': 'https://picsum.photos/seed/drinks-bottles/800/600',
  'cans': 'https://picsum.photos/seed/drinks-cans/800/600',
  'juice-cartons': 'https://picsum.photos/seed/juice-cartons/800/600',
};

async function fixImagesFinal() {
  try {
    console.log('🔧 Fixing broken images with reliable Lorem Picsum URLs...\n');
    
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
    console.log(`\n✨ Done! Images updated with reliable Lorem Picsum URLs.`);
    console.log(`\n💡 Note: Lorem Picsum provides reliable placeholder images.`);
    console.log(`   Replace with your actual food photos when ready!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagesFinal();

