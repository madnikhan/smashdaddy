import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/cart/[itemId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { quantity, specialInstructions, customizations } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Get the cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        menuItem: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Update the cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: cartItem.unitPrice * quantity,
        specialInstructions,
        customizations,
      },
      include: {
        menuItem: true,
      },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
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
      cartItem: updatedCartItem,
      cart: {
        id: updatedCart!.id,
        items: updatedCart!.items,
        total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    // Get the cart item to find the cart ID
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!updatedCart) {
      return NextResponse.json({
        items: [],
        total: 0,
        itemCount: 0,
      });
    }

    const total = updatedCart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
} 