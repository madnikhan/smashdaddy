import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // customer, driver, restaurant, admin
    const limit = parseInt(searchParams.get('limit') || '100');

    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        driver: true,
        restaurant: true,
        admin: true,
      },
    });

    // Filter by role if specified
    let filteredUsers = users;
    if (role) {
      filteredUsers = users.filter(user => {
        if (role === 'customer' && user.customer) return true;
        if (role === 'driver' && user.driver) return true;
        if (role === 'restaurant' && user.restaurant) return true;
        if (role === 'admin' && user.admin) return true;
        return false;
      });
    }

    return NextResponse.json({
      success: true,
      users: filteredUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: {
          customer: !!user.customer,
          driver: !!user.driver,
          restaurant: !!user.restaurant,
          admin: !!user.admin,
        },
      })),
      total: filteredUsers.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
