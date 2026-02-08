// Plain JS seed script for menu items
const { PrismaClient } = require('../generated/prisma');
const path = require('path');

const prisma = new PrismaClient();

async function loadMenuData() {
  // Load menuData from JSON file
  const fs = require('fs');
  const path = require('path');
  const menuJsonPath = path.resolve(__dirname, '../lib/menu-data.json');
  return JSON.parse(fs.readFileSync(menuJsonPath, 'utf-8'));
}

async function seedMenu() {
  try {
    console.log('🌱 Starting menu seeding (JS version)...');

    // Create or upsert the user
    const user = await prisma.user.upsert({
      where: { email: 'restaurant@smashdaddy.co.uk' },
      update: {},
      create: {
        email: 'restaurant@smashdaddy.co.uk',
        name: "SmashDaddy's Restaurant",
        emailVerified: new Date(),
      },
    });
    console.log('✅ User created:', user.email);

    // Create or upsert the restaurant
    const restaurant = await prisma.restaurant.upsert({
      where: { id: 'smashdaddy-daventry' },
      update: {},
      create: {
        id: 'smashdaddy-daventry',
        userId: user.id,
        name: "SmashDaddy's",
        description: 'Premium smashed burgers, grilled chicken, and wings in Daventry',
        phone: '01327 123 456',
        email: 'hello@smashdaddy.co.uk',
        address: "St John's Square",
        city: 'Daventry',
        county: 'Northamptonshire',
        postcode: 'NN11 4HY',
        country: 'United Kingdom',
        isActive: true,
        isApproved: true,
        deliveryFee: 2.99,
        minimumOrder: 10.00,
        deliveryRadius: 5.0,
        cuisineType: 'Burgers, Chicken, Fast Food',
      },
    });
    console.log('✅ Restaurant created:', restaurant.name);

    // Load menu data
    const menuData = await loadMenuData();

    for (const categoryData of menuData) {
      // Upsert category
      const category = await prisma.category.upsert({
        where: { id: categoryData.id },
        update: {
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
        },
        create: {
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          restaurantId: restaurant.id,
        },
      });
      console.log(`✅ Category created: ${category.name}`);

      // Upsert menu items
      for (const itemData of categoryData.items) {
        const menuItem = await prisma.menuItem.upsert({
          where: { id: itemData.id },
          update: {
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            isAvailable: itemData.isAvailable,
            isVegetarian: itemData.isVegetarian || false,
            isVegan: itemData.isVegan || false,
            isGlutenFree: itemData.isGlutenFree || false,
            isSpicy: itemData.isSpicy || false,
            allergens: Array.isArray(itemData.allergens) ? itemData.allergens.join(', ') : itemData.allergens || '',
            calories: itemData.calories,
            preparationTime: itemData.preparationTime,
            sortOrder: 0,
            image: itemData.image ?? null,
          },
          create: {
            id: itemData.id,
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            isAvailable: itemData.isAvailable,
            isVegetarian: itemData.isVegetarian || false,
            isVegan: itemData.isVegan || false,
            isGlutenFree: itemData.isGlutenFree || false,
            isSpicy: itemData.isSpicy || false,
            allergens: Array.isArray(itemData.allergens) ? itemData.allergens.join(', ') : itemData.allergens || '',
            calories: itemData.calories,
            preparationTime: itemData.preparationTime,
            sortOrder: 0,
            image: itemData.image ?? null,
            categoryId: category.id,
            restaurantId: restaurant.id,
          },
        });
        console.log(`  ✅ Menu item created: ${menuItem.name} - £${menuItem.price}`);
      }
    }
    console.log('🎉 Menu seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMenu()
  .then(() => {
    console.log('✅ Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 