import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  console.log('[SSE] New SSE connection established');
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Send initial connection message
  writer.write(
    `data: ${JSON.stringify({ type: 'connected', message: 'Connected to order notifications' })}\n\n`
  );

  // Subscribe to Redis channel
  await redis.subscribe('orders', (message: unknown) => {
    console.log('[Upstash][SSE] Received pub/sub message:', message);
    writer.write(`data: ${message}\n\n`);
  });

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    writer.close();
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'Connection': 'keep-alive',
    },
  });
} 