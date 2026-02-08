import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Submit a driver rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    // Check if driverRating model is available
    if (!prisma.driverRating) {
      console.error('[DriverRatingAPI] Prisma client does not have driverRating model. Please restart the server.');
      return NextResponse.json(
        { 
          error: 'Server configuration error', 
          details: 'DriverRating model not available. Please restart the server.',
          code: 'MODEL_NOT_AVAILABLE'
        },
        { status: 500 }
      );
    }

    const { driverId } = await params;
    const body = await request.json();
    const { orderId, customerEmail, customerName, rating, comment } = body;

    console.log('[DriverRatingAPI] Received rating request:', {
      driverId,
      orderId,
      customerEmail,
      customerName,
      rating,
      ratingType: typeof rating,
    });

    // Validate required fields
    if (!orderId || !customerEmail || !customerName || !rating) {
      return NextResponse.json(
        { error: 'Order ID, customer email, customer name, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating (1-5) - convert to number and ensure it's an integer
    const ratingNum = typeof rating === 'string' ? parseInt(rating, 10) : Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Use the validated number
    const validatedRating = ratingNum;

    // Check if order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true },
    });

    console.log('[DriverRatingAPI] Order found:', {
      orderId: order?.id,
      status: order?.status,
      driverId: order?.driverId,
      customerEmail: order?.customerEmail,
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: `Order must be delivered before rating the driver. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    if (!order.driverId) {
      return NextResponse.json(
        { error: 'Order does not have a driver assigned' },
        { status: 400 }
      );
    }

    if (order.driverId !== driverId) {
      return NextResponse.json(
        { error: 'Driver ID does not match the order' },
        { status: 400 }
      );
    }

    // Check if customer email matches order
    if (order.customerEmail !== customerEmail) {
      return NextResponse.json(
        { error: 'Customer email does not match the order' },
        { status: 403 }
      );
    }

    // Check if rating already exists for this order
    let existingRating;
    try {
      existingRating = await prisma.driverRating.findUnique({
        where: { orderId },
      });
      console.log('[DriverRatingAPI] Existing rating check:', existingRating ? 'Found' : 'Not found');
    } catch (findError) {
      console.error('[DriverRatingAPI] Error checking existing rating:', findError);
      throw findError;
    }

    let driverRating;
    try {
      if (existingRating) {
        // Update existing rating
        console.log('[DriverRatingAPI] Updating existing rating:', existingRating.id);
        driverRating = await prisma.driverRating.update({
          where: { id: existingRating.id },
          data: {
            rating: validatedRating,
            comment: comment || null,
          },
        });
      } else {
        // Create new rating
        console.log('[DriverRatingAPI] Creating new rating');
        driverRating = await prisma.driverRating.create({
          data: {
            driverId,
            orderId,
            customerEmail,
            customerName,
            rating: validatedRating,
            comment: comment || null,
          },
        });
      }
      console.log('[DriverRatingAPI] Rating saved successfully:', driverRating.id);
    } catch (dbError) {
      console.error('[DriverRatingAPI] Database error saving rating:', dbError);
      if (dbError && typeof dbError === 'object' && 'code' in dbError) {
        console.error('[DriverRatingAPI] Prisma error code:', (dbError as any).code);
        console.error('[DriverRatingAPI] Prisma error meta:', (dbError as any).meta);
      }
      throw dbError;
    }

    // Calculate and update driver's average rating
    let averageRating = 0;
    try {
      const allRatings = await prisma.driverRating.findMany({
        where: { driverId },
        select: { rating: true },
      });

      averageRating = allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : 0;

      console.log('[DriverRatingAPI] Updating driver average rating:', averageRating);

      await prisma.driver.update({
        where: { id: driverId },
        data: { rating: parseFloat(averageRating.toFixed(2)) },
      });
      
      console.log('[DriverRatingAPI] Driver rating updated successfully');
    } catch (updateError) {
      console.error('[DriverRatingAPI] Error updating driver rating:', updateError);
      // Don't fail the rating submission if driver update fails
      // The rating was already saved successfully
    }

    return NextResponse.json({
      success: true,
      rating: driverRating,
      averageRating: averageRating.toFixed(1),
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
    });

  } catch (error) {
    console.error('[DriverRatingAPI] Error submitting driver rating:', error);
    
    // Enhanced error logging
    let errorCode = 'UNKNOWN';
    let errorMeta: any = null;
    let errorMessage = 'Unknown error';
    let errorStack: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    }
    
    if (error && typeof error === 'object') {
      if ('code' in error) {
        errorCode = String((error as any).code);
        console.error('[DriverRatingAPI] Prisma error code:', errorCode);
      }
      if ('meta' in error) {
        errorMeta = (error as any).meta;
        console.error('[DriverRatingAPI] Prisma error meta:', JSON.stringify(errorMeta, null, 2));
      }
      if ('stack' in error) {
        errorStack = (error as any).stack;
        console.error('[DriverRatingAPI] Error stack:', errorStack);
      }
    }
    
    // Create a serializable error response
    const errorResponse: any = {
      error: 'Failed to submit rating',
      message: errorMessage,
      code: errorCode,
    };
    
    if (errorMeta) {
      errorResponse.meta = errorMeta;
    }
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
}

// GET - Get rating for a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const rating = await prisma.driverRating.findUnique({
      where: { orderId },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!rating) {
      return NextResponse.json({
        success: true,
        rating: null,
        message: 'No rating found for this order',
      });
    }

    return NextResponse.json({
      success: true,
      rating: {
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        driver: {
          id: rating.driver.id,
          name: rating.driver.user?.name || 'Driver',
          averageRating: rating.driver.rating,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching driver rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

