import { PrismaClient } from '../generated/prisma';
import { menuData } from '../lib/menu';

const prisma = new PrismaClient();

async function seedMenu() {
  try {
    console.log('🌱 Starting menu seeding...');

    // First, create a user for the restaurant
    const user = await prisma.user.upsert({
      where: { email: 'restaurant@stackd.co.uk' },
      update: {},
      create: {
        email: 'restaurant@stackd.co.uk',
        name: 'STACK\'D Restaurant',
        emailVerified: new Date(),
      },
    });

    console.log('✅ User created:', user.email);

    // Create a restaurant (STACK'D)
    const restaurant = await prisma.restaurant.upsert({
      where: { id: 'stackd-daventry' },
      update: {},
      create: {
        id: 'stackd-daventry',
        userId: user.id,
        name: 'STACK\'D',
        description: 'Premium smashed burgers, grilled chicken, and wings in Daventry',
        phone: '01327 123 456',
        email: 'hello@stackd.co.uk',
        address: 'St John\'s Square',
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

    // Create categories and menu items
    for (const categoryData of menuData) {
      // Create category
      const category = await prisma.category.upsert({
        where: { 
          id: categoryData.id 
        },
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

      // Create menu items for this category
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
            categoryId: category.id,
            restaurantId: restaurant.id,
          },
        });

        console.log(`  ✅ Menu item created: ${menuItem.name} - £${menuItem.price}`);

        // Create customizations if they exist
        if (itemData.customizations) {
          for (const customizationData of itemData.customizations) {
            const customization = await prisma.menuItemCustomization.upsert({
              where: { id: customizationData.id },
              update: {
                name: customizationData.name,
                price: customizationData.price ?? 0,
                isRequired: customizationData.required,
                maxChoices: customizationData.type === 'multiple' ? 5 : 1,
              },
              create: {
                id: customizationData.id,
                name: customizationData.name,
                price: customizationData.price ?? 0,
                isRequired: customizationData.required,
                maxChoices: customizationData.type === 'multiple' ? 5 : 1,
                menuItemId: menuItem.id,
              },
            });

            // Create customization choices
            for (const optionData of customizationData.options) {
              await prisma.customizationChoice.upsert({
                where: { id: optionData.id },
                update: {
                  name: optionData.name,
                  price: optionData.price,
                  isAvailable: optionData.available,
                },
                create: {
                  id: optionData.id,
                  name: optionData.name,
                  price: optionData.price,
                  isAvailable: optionData.available,
                  customizationId: customization.id,
                },
              });
            }

            console.log(`    ✅ Customization created: ${customization.name}`);
          }
        }
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

// Run the seed function
seedMenu()
  .then(() => {
    console.log('✅ Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 