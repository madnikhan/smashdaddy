import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLocation = searchParams.get('includeLocation') === 'true';

    // Get all active drivers (available and with recent location updates)
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
        // Only include drivers with recent location updates (within last 30 minutes)
        updatedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
      },
      include: {
        user: true,
        deliveries: {
          where: {
            status: 'OUT_FOR_DELIVERY',
          },
          include: {
            customer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Filter out drivers without location if requested
    const driversWithLocation = includeLocation 
      ? drivers.filter(driver => driver.currentLocation)
      : drivers;

    return NextResponse.json({
      success: true,
      drivers: driversWithLocation,
      count: driversWithLocation.length,
    });

  } catch (error) {
    console.error('Error fetching active drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active drivers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 