import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Build the where clause based on provided identifier
    const whereClause: {
      customerEmail?: string;
      customerPhone?: string;
    } = {};
    
    if (email) {
      whereClause.customerEmail = email;
    }
    if (phone) {
      whereClause.customerPhone = phone;
    }

    // Fetch orders for the customer
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 orders
    });

    // Group orders by date and add summary info
    const orderHistory = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      orderType: order.orderType,
      total: order.total,
      status: order.status,
      itemCount: order.items.length,
      items: order.items.map(item => ({
        name: item.menuItemName,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      customerDetails: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.customerAddress,
        city: order.customerCity,
        postcode: order.customerPostcode,
      },
    }));

    return NextResponse.json({
      success: true,
      orders: orderHistory,
      totalOrders: orders.length,
    });

  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order history' },
      { status: 500 }
    );
  }
} 