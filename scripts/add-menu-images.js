// Helper script to add image paths to menu items in the database
// Usage: node scripts/add-menu-images.js

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

// Map of menu item IDs to image filenames
// Add your image mappings here
const imageMappings = {
  // Grilled Chicken
  'quarter-chicken': 'quarter-chicken.jpg',
  'half-chicken': 'half-chicken.jpg',
  'full-chicken': 'full-chicken.jpg',
  'chicken-strips': 'chicken-strips.jpg',
  'peri-wings-5': 'peri-wings-5.jpg',
  'peri-wings-10': 'peri-wings-10.jpg',
  
  // Burgers
  'single-smash': 'single-smash-burger.jpg',
  'double-smash': 'double-smash-burger.jpg',
  'triple-smash': 'triple-smash-burger.jpg',
  'zinger-chicken': 'zinger-chicken-burger.jpg',
  'peri-chicken-burger': 'peri-chicken-burger.jpg',
  'meat-free-classic': 'meat-free-burger.jpg',
  'veggie-patty': 'veggie-patty-burger.jpg',
  
  // Wraps
  'grilled-chicken-wrap': 'chicken-wrap.jpg',
  'lamb-kofta-wrap': 'lamb-kofta-wrap.jpg',
  'beef-kofta-wrap': 'beef-kofta-wrap.jpg',
  
  // Rice Boxes
  'peri-chicken-rice': 'peri-chicken-rice.jpg',
  
  // Kids Meals
  'kids-popcorn': 'kids-popcorn.jpg',
  'kids-cheeseburger': 'kids-cheeseburger.jpg',
  'kids-chicken-burger': 'kids-chicken-burger.jpg',
  
  // Sides
  'regular-fries': 'regular-fries.jpg',
  'peri-fries': 'peri-fries.jpg',
  'cheesy-fries': 'cheesy-fries.jpg',
  'coleslaw': 'coleslaw.jpg',
  
  // Meal Deals
  'smash-burger-meal': 'smash-burger-meal.jpg',
  'chicken-burger-meal': 'chicken-burger-meal.jpg',
  'wrap-meal': 'wrap-meal.jpg',
  'rice-box-meal': 'rice-box-meal.jpg',
  'wings-combo-meal': 'wings-combo-meal.jpg',
};

async function addMenuImages() {
  try {
    console.log('🖼️  Adding images to menu items...\n');
    
    let updated = 0;
    let skipped = 0;
    
    for (const [itemId, imagePath] of Object.entries(imageMappings)) {
      try {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: itemId },
        });
        
        if (menuItem) {
          await prisma.menuItem.update({
            where: { id: itemId },
            data: { image: imagePath },
          });
          console.log(`✅ Updated: ${menuItem.name} -> ${imagePath}`);
          updated++;
        } else {
          console.log(`⚠️  Skipped: Item with ID "${itemId}" not found`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${itemId}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} items`);
    console.log(`   ⚠️  Skipped: ${skipped} items`);
    console.log(`\n✨ Done!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMenuImages();

