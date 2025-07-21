import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    // Build where clause
    const where: {
      category?: { name: string };
      isAvailable?: boolean;
    } = {};
    
    if (category && category !== 'all') {
      where.category = {
        name: category.toUpperCase()
      };
    }
    
    if (available === 'true') {
      where.isAvailable = true;
    }

    // Fetch menu items with categories
    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { name: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      menuItems: menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: {
          id: item.category.id,
          name: item.category.name,
        },
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian,
        allergens: item.allergens,
        preparationTime: item.preparationTime,
      })),
      total: menuItems.length,
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 