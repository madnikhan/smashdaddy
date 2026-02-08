import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get all orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        paymentStatus: 'COMPLETED',
      },
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get total customers
    const totalCustomers = await prisma.customer.count();

    // Get total drivers
    const totalDrivers = await prisma.driver.count();

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach(order => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Revenue by day
    const revenueByDayMap = new Map<string, { revenue: number; orders: number }>();
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = revenueByDayMap.get(dateKey) || { revenue: 0, orders: 0 };
      revenueByDayMap.set(dateKey, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      });
    });

    const revenueByDay = Array.from(revenueByDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        totalDrivers,
        ordersByStatus,
        revenueByDay,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

