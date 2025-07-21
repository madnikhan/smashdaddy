import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // Validate required fields
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    // Find driver by phone number
    const driver = await prisma.driver.findFirst({
      where: { phone },
      include: {
        user: true,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found with this phone number' },
        { status: 404 }
      );
    }

    // Check if driver has a password (for backward compatibility)
    if (!driver.password) {
      return NextResponse.json(
        { error: 'Driver account not properly set up. Please contact support.' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, driver.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Return driver data (without password)
    const { password: _, ...driverData } = driver;

    return NextResponse.json({
      success: true,
      driver: driverData,
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Error during driver login:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate driver', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 