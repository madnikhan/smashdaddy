import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Fetch orders for the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Payment method breakdown
    const paymentMethods = orders.reduce((acc, order) => {
      const method = order.paymentMethod?.toLowerCase() || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Order type breakdown
    const orderTypes = orders.reduce((acc, order) => {
      const type = order.orderType?.toLowerCase() || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top selling items
    const itemSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const itemName = item.menuItemName;
        if (!acc[itemName]) {
          acc[itemName] = { quantity: 0, revenue: 0 };
        }
        acc[itemName].quantity += item.quantity;
        acc[itemName].revenue += item.totalPrice;
      });
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number }>);

    const topItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
      }));

    // Hourly breakdown
    const hourlySales = orders.reduce((acc, order) => {
      const hour = new Date(order.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + order.total;
      return acc;
    }, {} as Record<number, number>);

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      report: {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
        },
        breakdowns: {
          paymentMethods,
          orderTypes,
          statusBreakdown,
        },
        topItems,
        hourlySales,
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
          orderType: order.orderType,
          createdAt: order.createdAt,
        })),
      },
    });

  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
} 