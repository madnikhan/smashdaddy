import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sessionId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch the original order with items
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!originalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }



    // Get or create cart for the session
    let cart = await prisma.cart.findUnique({
      where: { sessionId: sessionId || undefined },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId: sessionId || undefined },
      });
    }

    // Add items from the original order to the cart
    const cartItems = await Promise.all(
      originalOrder.items.map(async (item) => {
        // First, verify the menu item exists
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          console.error(`Menu item not found: ${item.menuItemId}`);
          throw new Error(`Menu item not found: ${item.menuItemId}`);
        }

        // Check if item already exists in cart
        const existingCartItem = await prisma.cartItem.findUnique({
          where: {
            cartId_menuItemId: {
              cartId: cart!.id,
              menuItemId: item.menuItemId,
            },
          },
        });

        if (existingCartItem) {
          // Update quantity if item already exists
          return prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: {
              quantity: existingCartItem.quantity + item.quantity,
              totalPrice: (existingCartItem.quantity + item.quantity) * existingCartItem.unitPrice,
            },
            include: {
              menuItem: true,
            },
          });
        } else {
          // Create new cart item
          return prisma.cartItem.create({
            data: {
              cartId: cart!.id,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            },
            include: {
              menuItem: true,
            },
          });
        }
      })
    );

    // Fetch updated cart with all items
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

    if (!updatedCart) {
      throw new Error('Failed to fetch updated cart');
    }

    const total = updatedCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      message: 'Items added to cart successfully',
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        total,
        itemCount,
      },
      addedItems: cartItems.length,
    });

  } catch (error) {
    console.error('Error processing reorder:', error);
    return NextResponse.json(
      { error: `Failed to process reorder: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 