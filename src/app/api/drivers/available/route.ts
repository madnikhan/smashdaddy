import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all available drivers
export async function GET(request: NextRequest) {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        user: true,
      },
      orderBy: {
        rating: 'desc', // Prioritize higher rated drivers
      },
    });

    return NextResponse.json({
      success: true,
      drivers: drivers.map(driver => ({
        id: driver.id,
        userId: driver.userId,
        phone: driver.phone,
        vehicleInfo: driver.vehicleInfo,
        isAvailable: driver.isAvailable,
        currentLocation: driver.currentLocation,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        earnings: driver.earnings,
        user: driver.user ? {
          id: driver.user.id,
          name: driver.user.name,
          email: driver.user.email,
        } : null,
      })),
      total: drivers.length,
    });

  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available drivers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 