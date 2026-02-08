import { redis } from '@/lib/redis';

export async function broadcastNotification(data: Record<string, unknown>) {
  try {
    if (!redis) {
      console.warn('[Broadcast] Redis not configured, skipping broadcast');
      return;
    }
    await redis.publish('orders', JSON.stringify(data));
  } catch (error) {
    console.error('[Broadcast] Failed to publish notification:', error);
    // Non-critical: do not throw so order flow continues
  }
} 