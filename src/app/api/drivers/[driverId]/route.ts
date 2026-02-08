import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Update driver information
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await request.json();
    const { isAvailable, currentLocation, rating, totalDeliveries, earnings } = body;

    // Update driver
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(isAvailable !== undefined && { isAvailable }),
        ...(currentLocation && { currentLocation }),
        ...(rating !== undefined && { rating }),
        ...(totalDeliveries !== undefined && { totalDeliveries }),
        ...(earnings !== undefined && { earnings }),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      driver: {
        id: updatedDriver.id,
        userId: updatedDriver.userId,
        phone: updatedDriver.phone,
        vehicleInfo: updatedDriver.vehicleInfo,
        isAvailable: updatedDriver.isAvailable,
        currentLocation: updatedDriver.currentLocation,
        rating: updatedDriver.rating,
        totalDeliveries: updatedDriver.totalDeliveries,
        earnings: updatedDriver.earnings,
        createdAt: updatedDriver.createdAt,
        updatedAt: updatedDriver.updatedAt,
        user: updatedDriver.user ? {
          id: updatedDriver.user.id,
          name: updatedDriver.user.name,
          email: updatedDriver.user.email,
        } : null,
      },
    });

  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { error: 'Failed to update driver', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Get specific driver
export async function GET(request: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  try {
    const { driverId } = await params;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
        deliveries: {
          where: {
            status: {
              in: ['OUT_FOR_DELIVERY', 'DELIVERED']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      driver: {
        id: driver.id,
        userId: driver.userId,
        phone: driver.phone,
        vehicleInfo: driver.vehicleInfo,
        isAvailable: driver.isAvailable,
        currentLocation: driver.currentLocation,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        earnings: driver.earnings,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
        user: driver.user ? {
          id: driver.user.id,
          name: driver.user.name,
          email: driver.user.email,
        } : null,
        recentDeliveries: driver.deliveries.length,
      },
    });

  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 