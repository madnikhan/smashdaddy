// Script to update ALL menu items with reliable image URLs
// Uses specific Unsplash photo IDs that are known to work
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Comprehensive image mappings with reliable URLs
const allImageMappings = {
  // Grilled Chicken
  'quarter-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  'half-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  'full-chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
  'chicken-strips': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  'peri-wings-5': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  'peri-wings-10': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  
  // Burgers
  'single-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'double-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'triple-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'zinger-chicken': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  'peri-chicken-burger': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  'meat-free-classic': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop',
  'veggie-patty': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop',
  
  // Wraps
  'grilled-chicken-wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'lamb-kofta-wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'beef-kofta-wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  
  // Rice Boxes
  'peri-chicken-rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  
  // Kids Meals
  'kids-popcorn': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  'kids-cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'kids-chicken-burger': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  
  // Sides
  'regular-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
  'peri-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
  'cheesy-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
  'coleslaw': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  'garlic-mayo': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?w=800&h=600&fit=crop',
  'peri-dip': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?w=800&h=600&fit=crop',
  'bbq-sauce': 'https://images.unsplash.com/photo-1606914469633-bd392107ea61?w=800&h=600&fit=crop',
  
  // Drinks
  'cans': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=600&fit=crop',
  'bottles': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=600&fit=crop',
  'juice-cartons': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&h=600&fit=crop',
  
  // Meal Deals
  'smash-burger-meal': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'chicken-burger-meal': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  'wrap-meal': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop',
  'rice-box-meal': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
  'wings-combo-meal': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
};

async function updateAllImages() {
  try {
    console.log('🖼️  Updating all menu items with reliable image URLs...\n');
    
    const allMenuItems = await prisma.menuItem.findMany({
      select: { id: true, name: true },
    });
    
    let updated = 0;
    let notFound = 0;
    
    for (const item of allMenuItems) {
      const imageUrl = allImageMappings[item.id];
      
      if (imageUrl) {
        try {
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { image: imageUrl },
          });
          console.log(`✅ Updated: ${item.name}`);
          updated++;
        } catch (error) {
          console.error(`❌ Error updating ${item.name}:`, error.message);
          notFound++;
        }
      } else {
        // Use generic food placeholder for items without mapping
        const genericImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
        try {
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { image: genericImage },
          });
          console.log(`✅ Updated (generic): ${item.name}`);
          updated++;
        } catch (error) {
          console.error(`❌ Error updating ${item.name}:`, error.message);
          notFound++;
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⚠️  Errors: ${notFound} items`);
    console.log(`\n✨ Done! All images updated with reliable URLs.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllImages();

