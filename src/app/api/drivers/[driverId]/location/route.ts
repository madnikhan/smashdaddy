import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await request.json();
    const { latitude, longitude, accuracy, timestamp } = body;

    // Validate required fields
    if (!driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Driver ID, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Update driver location
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLocation: {
          latitude,
          longitude,
          accuracy: accuracy || null,
          timestamp: timestamp || new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      driver: updatedDriver,
      message: 'Location updated successfully',
    });

  } catch (error) {
    console.error('Error updating driver location:', error);
    return NextResponse.json(
      { error: 'Failed to update location', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
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
      driver,
    });

  } catch (error) {
    console.error('Error fetching driver location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver location', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 