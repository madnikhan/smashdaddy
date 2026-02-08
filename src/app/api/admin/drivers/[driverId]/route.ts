import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Delete a driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;

    // Check if driver has any active orders
    const activeOrders = await prisma.order.count({
      where: {
        driverId,
        status: {
          in: ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'],
        },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete driver with active orders' },
        { status: 400 }
      );
    }

    // Delete driver (cascade will handle related records)
    await prisma.driver.delete({
      where: { id: driverId },
    });

    return NextResponse.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { error: 'Failed to delete driver', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update driver
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const body = await request.json();

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.phone && { phone: body.phone }),
        ...(body.vehicleInfo && { vehicleInfo: body.vehicleInfo }),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      driver: {
        id: updatedDriver.id,
        phone: updatedDriver.phone,
        vehicleInfo: updatedDriver.vehicleInfo,
        isAvailable: updatedDriver.isAvailable,
        rating: updatedDriver.rating,
        totalDeliveries: updatedDriver.totalDeliveries,
        user: {
          name: updatedDriver.user.name,
          email: updatedDriver.user.email,
        },
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

