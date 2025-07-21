import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processCardPayment, processCashPayment } from '@/lib/sumup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      orderNumber,
      amount,
      paymentMethod,
      cashAmount,
    } = body;

    // Validate required fields
    if (!orderId || !orderNumber || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    let transactionId;

    if (paymentMethod === 'card') {
      // Process card payment with SumUp
      const sumupResult = await processCardPayment(
        amount,
        'GBP',
        `STACK'D Order #${orderNumber}`
      );

      if (sumupResult.success) {
        transactionId = sumupResult.transactionId;
      } else {
        return NextResponse.json(
          { error: 'Card payment failed', details: sumupResult.error },
          { status: 400 }
        );
      }
    } else if (paymentMethod === 'cash') {
      // Process cash payment
      const cashResult = await processCashPayment(
        amount,
        `STACK'D Order #${orderNumber}`,
        orderId
      );

      transactionId = cashResult.id;
    } else {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

          // Update order payment status in database
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PREPARING', // Payment completed -> start preparing
          },
        });

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId,
          amount,
          currency: 'GBP',
          status: 'COMPLETED',
          method: paymentMethod.toUpperCase() as 'CARD' | 'CASH',
          sumupTransactionId: transactionId,
        },
      });

      // Log payment activity
      console.log(`Payment processed: Order #${orderNumber}, Amount: £${amount}, Method: ${paymentMethod}, Transaction: ${transactionId}`);

    } catch (dbError) {
      console.error('Database update error:', dbError);
      // Payment was successful but database update failed
      // In production, you might want to implement retry logic or alerting
    }

    return NextResponse.json({
      success: true,
      transactionId,
      orderNumber,
      amount,
      paymentMethod,
      message: 'Payment processed successfully',
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 