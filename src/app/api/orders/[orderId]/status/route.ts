import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastNotification } from '../../notifications/broadcast';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status, staffId, notes, driverId } = body;

    console.log('Status update request:', { orderId, status, staffId, notes, driverId });

    // Validate required fields
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status values and map frontend-friendly names to enum values
    const statusMapping: Record<string, string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED', 
      'preparing': 'PREPARING',
      'ready': 'READY_FOR_PICKUP',
      'ready_for_pickup': 'READY_FOR_PICKUP',
      'out_for_delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED',
      'completed': 'DELIVERED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED',
      // Also accept uppercase enum values directly
      'PENDING': 'PENDING',
      'CONFIRMED': 'CONFIRMED',
      'PREPARING': 'PREPARING', 
      'READY_FOR_PICKUP': 'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED',
      'REFUNDED': 'REFUNDED'
    };

    const mappedStatus = statusMapping[status.toLowerCase()];
    console.log('Status mapping:', { originalStatus: status, mappedStatus });
    
    if (!mappedStatus) {
      return NextResponse.json(
        { error: `Invalid order status: ${status}. Valid statuses are: ${Object.keys(statusMapping).join(', ')}` },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: mappedStatus,
      updatedAt: new Date(),
    };

    // If status is OUT_FOR_DELIVERY and driverId is provided, assign driver
    if (mappedStatus === 'OUT_FOR_DELIVERY' && driverId) {
      // Verify driver exists and is available
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driver) {
        return NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        );
      }

      if (!driver.isAvailable) {
        return NextResponse.json(
          { error: 'Driver is not available' },
          { status: 400 }
        );
      }

      updateData.driverId = driverId;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        payment: true,
        driver: {
          include: {
            user: true,
          },
        },
      },
    });

    // Broadcast to kitchen panel
    broadcastNotification({ type: 'order_update', orderId });

    // Log status change
    console.log(`Order ${orderId} status updated to ${mappedStatus} by staff ${staffId || 'unknown'}`);

    // TODO: Send notifications based on status change
    // - Email/SMS to customer when order is ready
    // - Kitchen notification when order is confirmed
    // - Driver notification when order is ready for delivery

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${mappedStatus}`,
    });

  } catch (error) {
    let errorMessage = 'Failed to update order status';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: { 
        status: status.toUpperCase(),
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

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

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 