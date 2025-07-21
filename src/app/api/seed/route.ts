import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Check if we already have menu items
    const existingItems = await prisma.menuItem.count();
    if (existingItems > 0) {
      return NextResponse.json({
        message: 'Database already has menu items',
        count: existingItems,
      });
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: 'admin@stackd-daventry.co.uk',
        name: 'STACK\'D Admin',
        emailVerified: new Date(),
      },
    });

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        userId: user.id,
        name: 'STACK\'D',
        address: 'St John\'s Square',
        city: 'Daventry',
        county: 'Northamptonshire',
        postcode: 'NN11 4HY',
        country: 'United Kingdom',
        phone: '+44 (0) 1327 123 4567',
        email: 'hello@stackd-daventry.co.uk',
        isActive: true,
      },
    });

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'BURGERS',
          description: 'Smashed burgers with premium ingredients',
          sortOrder: 1,
          restaurantId: restaurant.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'GRILLED CHICKEN',
          description: 'Flame-grilled peri chicken',
          sortOrder: 2,
          restaurantId: restaurant.id,
        },
      }),
      prisma.category.create({
        data: {
          name: 'SIDES',
          description: 'Delicious sides and extras',
          sortOrder: 3,
          restaurantId: restaurant.id,
        },
      }),
    ]);

    // Create menu items
    const menuItems = await Promise.all([
      prisma.menuItem.create({
        data: {
          name: 'Single Smash Burger',
          description: 'Served with smashed patties, STACK\'D sauce, American cheese & pickles.',
          price: 6.99,
          categoryId: categories[0].id,
          restaurantId: restaurant.id,
          preparationTime: 10,
          isAvailable: true,
          isVegetarian: false,
          allergens: 'gluten,dairy',
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Double Smash Burger',
          description: 'Served with smashed patties, STACK\'D sauce, American cheese & pickles.',
          price: 8.49,
          categoryId: categories[0].id,
          restaurantId: restaurant.id,
          preparationTime: 12,
          isAvailable: true,
          isVegetarian: false,
          allergens: 'gluten,dairy',
        },
      }),
      prisma.menuItem.create({
        data: {
          name: '1/4 Grilled Chicken',
          description: 'All chicken is roasted, then flame-grilled with your choice of peri sauce.',
          price: 5.99,
          categoryId: categories[1].id,
          restaurantId: restaurant.id,
          preparationTime: 15,
          isAvailable: true,
          isVegetarian: false,
          allergens: '',
        },
      }),
      prisma.menuItem.create({
        data: {
          name: 'Regular Fries',
          description: 'Crispy golden fries',
          price: 2.49,
          categoryId: categories[2].id,
          restaurantId: restaurant.id,
          preparationTime: 5,
          isAvailable: true,
          isVegetarian: true,
          allergens: '',
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully',
      restaurant: restaurant.name,
      categories: categories.length,
      menuItems: menuItems.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 