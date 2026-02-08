import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[SSE] New SSE connection established');
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Send initial connection message
  writer.write(
    `data: ${JSON.stringify({ type: 'connected', message: 'Connected to order notifications' })}\n\n`
  );

  // Note: Upstash Redis REST API doesn't support real-time pub/sub subscriptions
  // This is a placeholder - consider using Pusher or WebSockets for real-time updates
  // For now, we'll use polling or a different approach
  console.warn('[SSE] Redis pub/sub not available with Upstash REST API. Consider using Pusher or WebSockets.');
  
  // Send a connection message
  const keepAlive = setInterval(() => {
    writer.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`).catch(() => {
      clearInterval(keepAlive);
  });
  }, 30000);

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