import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastNotification } from './notifications/broadcast';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerPostcode,
      orderType,
      items,
      specialInstructions,
      subtotal,
      tax = 0,
      deliveryFee = 0,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the current max sequenceNumber (filter out nulls just in case)
    const lastOrder = await prisma.order.findFirst({
      where: { sequenceNumber: { not: undefined } },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true },
    });
    const nextSequence = (lastOrder?.sequenceNumber || 0) + 1;
    const formattedOrderNumber = `ST-${nextSequence.toString().padStart(3, '0')}`;

    // Calculate total
    const total = subtotal + tax + deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: formattedOrderNumber,
        sequenceNumber: nextSequence,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        customerPostcode,
        orderType: orderType.toUpperCase(),
        status: 'PENDING', // Always set to PENDING on creation
        paymentStatus: 'PENDING',
        subtotal,
        tax,
        deliveryFee,
        total,
        specialInstructions,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            menuItemName: item.name,
            menuItemDescription: item.description,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Broadcast to kitchen panel
    await broadcastNotification({ type: 'order_update', orderId: order.id });
    console.log('[OrderAPI] broadcastNotification called for new order:', order.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        total: order.total,
        specialInstructions: order.specialInstructions,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          name: item.menuItemName,
          description: item.menuItemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      },
    });

  } catch (error: any) {
    // Enhanced error logging for Prisma and general errors
    if (error && typeof error === 'object') {
      if (error.code) {
        console.error('Prisma error code:', error.code);
      }
      if (error.message) {
        console.error('Error creating order:', error.message);
      }
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      if (error.meta) {
        console.error('Prisma meta:', error.meta);
      }
    } else {
      console.error('Unknown error creating order:', error);
    }
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error && error.message ? error.message : 'Unknown error',
        prismaCode: error && error.code ? error.code : undefined,
        meta: error && error.meta ? error.meta : undefined,
        stack: error && error.stack ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('orderNumber');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (orderNumber) {
      where.orderNumber = orderNumber;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        driver: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        total: order.total,
        specialInstructions: order.specialInstructions,
        driver: order.driver ? {
          id: order.driver.id,
          phone: order.driver.phone,
          vehicleInfo: order.driver.vehicleInfo,
          user: order.driver.user ? {
            name: order.driver.user.name,
          } : null,
        } : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          name: item.menuItemName,
          description: item.menuItemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      })),
      total: orders.length,
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 