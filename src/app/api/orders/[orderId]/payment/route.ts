import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Process payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json();
    const { paymentStatus, paymentMethod = 'CASH' } = body;

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validPaymentStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
    if (!validPaymentStatuses.includes(paymentStatus.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

    // Update order payment status
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: { 
        paymentStatus: paymentStatus.toUpperCase(),
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    // Create or update payment record
    if (paymentStatus.toUpperCase() === 'COMPLETED') {
      await prisma.payment.upsert({
        where: { orderId: params.orderId },
        update: {
          status: 'COMPLETED',
          method: paymentMethod.toUpperCase(),
          updatedAt: new Date(),
        },
        create: {
          orderId: params.orderId,
          amount: order.total,
          currency: 'GBP',
          status: 'COMPLETED',
          method: paymentMethod.toUpperCase(),
        },
      });
    }

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
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 