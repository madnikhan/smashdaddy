import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch all drivers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available');
    const phone = searchParams.get('phone');
    const password = searchParams.get('password'); // For login validation
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (available === 'true') {
      where.isAvailable = true;
    }
    if (phone) {
      where.phone = phone;
    }

    const drivers = await prisma.driver.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    });

    // If password is provided, validate it for login
    if (phone && password && drivers.length > 0) {
      const driver = drivers[0];
      if (driver.password) {
        const isValidPassword = await bcrypt.compare(password, driver.password);
        if (!isValidPassword) {
          return NextResponse.json({
            success: false,
            error: 'Invalid credentials'
          }, { status: 401 });
        }
      } else {
        // Driver exists but has no password (old record)
        return NextResponse.json({
          success: false,
          error: 'Invalid credentials'
        }, { status: 401 });
      }
    }

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
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
        user: driver.user ? {
          id: driver.user.id,
          name: driver.user.name,
          email: driver.user.email,
        } : null,
        recentDeliveries: driver.deliveries.length,
      })),
      total: drivers.length,
    });

  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create/register a new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      phone,
      password,
      vehicleInfo,
      isAvailable = false,
    } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if driver already exists with this phone number
    const existingDriver = await prisma.driver.findFirst({
      where: { phone },
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: 'Driver with this phone number already exists' },
        { status: 400 }
      );
    }

    let actualUserId = userId;

    // If userId is provided, check if it exists
    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        // Create a new user for this driver
        const newUser = await prisma.user.create({
          data: {
            email: `driver-${Date.now()}@stackd.co.uk`,
            name: `Driver ${Date.now()}`,
            emailVerified: new Date(),
          },
        });
        actualUserId = newUser.id;
      }
    } else {
      // Create a new user for this driver
      const newUser = await prisma.user.create({
        data: {
          email: `driver-${Date.now()}@stackd.co.uk`,
          name: `Driver ${Date.now()}`,
          emailVerified: new Date(),
        },
      });
      actualUserId = newUser.id;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new driver
    const driver = await prisma.driver.create({
      data: {
        userId: actualUserId,
        phone,
        password: hashedPassword, // Store hashed password
        vehicleInfo: vehicleInfo || null,
        isAvailable,
        rating: 0,
        totalDeliveries: 0,
        earnings: 0,
      },
      include: {
        user: true,
      },
    });

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
      },
    });

  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 