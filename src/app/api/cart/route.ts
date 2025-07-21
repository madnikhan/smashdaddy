import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cart - Fetch cart contents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const customerId = searchParams.get('customerId');

    if (!sessionId && !customerId) {
      return NextResponse.json(
        { error: 'Session ID or Customer ID is required' },
        { status: 400 }
      );
    }

    let cart;
    if (customerId) {
      // Fetch cart for logged-in customer
      cart = await prisma.cart.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    } else {
      // Fetch cart for guest user
      cart = await prisma.cart.findUnique({
        where: { sessionId: sessionId || undefined },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    }

    if (!cart) {
      return NextResponse.json({ items: [], total: 0, itemCount: 0 });
    }

    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      id: cart.id,
      items: cart.items,
      total,
      itemCount,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menuItemId, quantity, sessionId, customerId, specialInstructions, customizations } = body;

    console.log('Adding item to cart:', { menuItemId, quantity, sessionId, customerId });

    if (!menuItemId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Menu item ID and valid quantity are required' },
        { status: 400 }
      );
    }

    if (!sessionId && !customerId) {
      return NextResponse.json(
        { error: 'Session ID or Customer ID is required' },
        { status: 400 }
      );
    }

    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Get menu item to calculate price
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      console.error('Menu item not found:', menuItemId);
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    if (!menuItem.isAvailable) {
      return NextResponse.json(
        { error: 'Menu item is not available' },
        { status: 400 }
      );
    }

    const unitPrice = menuItem.price;
    const totalPrice = unitPrice * quantity;

    // Find or create cart
    let cart;
    if (customerId) {
      cart = await prisma.cart.findUnique({
        where: { customerId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId },
        });
      }
    } else {
      cart = await prisma.cart.findUnique({
        where: { sessionId: sessionId || undefined },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId: sessionId || undefined },
        });
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Update existing item
      const newQuantity = existingCartItem.quantity + quantity;
      const newTotalPrice = unitPrice * newQuantity;

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          specialInstructions,
          customizations,
        },
        include: {
          menuItem: true,
        },
      });
    } else {
      // Add new item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity,
          unitPrice,
          totalPrice,
          specialInstructions,
          customizations,
        },
        include: {
          menuItem: true,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const total = updatedCart!.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cartItem,
      cart: {
        id: updatedCart!.id,
        items: updatedCart!.items,
        total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 