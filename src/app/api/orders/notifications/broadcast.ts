import { redis } from '@/lib/redis';

export async function broadcastNotification(data: any) {
  await redis.publish('orders', JSON.stringify(data));
} 