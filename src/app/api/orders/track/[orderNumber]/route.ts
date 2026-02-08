import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch order details with driver location for tracking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    console.log('[TrackOrderAPI] Received request for order:', orderNumber);

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Normalize order number (trim and uppercase)
    const normalizedOrderNumber = orderNumber.trim().toUpperCase();

    const order = await prisma.order.findUnique({
      where: { orderNumber: normalizedOrderNumber },
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
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get driver location if driver is assigned
    let driverLocation = null;
    if (order.driver && order.driver.currentLocation) {
      const location = order.driver.currentLocation as any;
      driverLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: location.timestamp || order.driver.updatedAt,
      };
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        customerCity: order.customerCity,
        customerPostcode: order.customerPostcode,
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
        driver: order.driver ? {
          id: order.driver.id,
          name: order.driver.user?.name || 'Driver',
          phone: order.driver.phone,
          vehicleInfo: order.driver.vehicleInfo,
          isAvailable: order.driver.isAvailable,
          location: driverLocation,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error fetching order for tracking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

