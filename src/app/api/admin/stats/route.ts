import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total drivers
    const totalDrivers = await prisma.driver.count();
    const activeDrivers = await prisma.driver.count({
      where: { isAvailable: true },
    });

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
        },
        paymentStatus: 'COMPLETED',
      },
      select: {
        total: true,
      },
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING'],
        },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        totalOrders,
        todayRevenue,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

