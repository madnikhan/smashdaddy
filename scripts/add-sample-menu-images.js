// Script to add sample/placeholder images to all menu items
// Uses placeholder image service for food-related images

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Map menu items to appropriate placeholder images
// Using Unsplash Source API for food-related placeholder images
const imageMappings = {
  // Grilled Chicken - use chicken/grilled food images
  'quarter-chicken': 'https://images.unsplash.com/photo-1608039829570-50d97ba8622c?w=800&h=600&fit=crop',
  'half-chicken': 'https://images.unsplash.com/photo-1608039829570-50d97ba8622c?w=800&h=600&fit=crop',
  'full-chicken': 'https://images.unsplash.com/photo-1608039829570-50d97ba8622c?w=800&h=600&fit=crop',
  'chicken-strips': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  'peri-wings-5': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  'peri-wings-10': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
  
  // Burgers - use burger images
  'single-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'double-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'triple-smash': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  'zinger-chicken': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  'peri-chicken-burger': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
  'meat-free-classic': 'https://images.unsplash.com/photo-1525059696034-4967a7290022?w=800&h=600&fit=crop',
  'veggie-patty': 'https://images.unsplash.com/photo-1525059696034-4967a7290022?w=800&h=600&fit=crop',
  
  // Wraps - use wrap/burrito images
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
  'coleslaw': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
  'garlic-mayo': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
  'peri-dip': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
  'bbq-sauce': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
  
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

async function addSampleImages() {
  try {
    console.log('🖼️  Adding sample images to all menu items...\n');
    
    // Get all menu items
    const allMenuItems = await prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
    
    console.log(`Found ${allMenuItems.length} menu items\n`);
    
    let updated = 0;
    let skipped = 0;
    let alreadyHasImage = 0;
    
    for (const item of allMenuItems) {
      try {
        // Skip if already has an image
        if (item.image) {
          console.log(`⏭️  Skipped (has image): ${item.name}`);
          alreadyHasImage++;
          continue;
        }
        
        // Check if we have a mapping for this item
        const imageUrl = imageMappings[item.id];
        
        if (imageUrl) {
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { image: imageUrl },
          });
          console.log(`✅ Updated: ${item.name} -> ${imageUrl.substring(0, 50)}...`);
          updated++;
        } else {
          // Use a generic food placeholder for items without specific mapping
          const genericImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { image: genericImage },
          });
          console.log(`✅ Updated (generic): ${item.name}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${item.name}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⏭️  Already had images: ${alreadyHasImage} items`);
    console.log(`   ⚠️  Skipped (errors): ${skipped} items`);
    console.log(`\n✨ Done! All menu items now have sample images.`);
    console.log(`\n💡 Note: These are placeholder images from Unsplash.`);
    console.log(`   Replace them with your actual food photos when ready!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleImages();

