import { Redis } from '@upstash/redis';

/** Optional: only created when Upstash Redis env vars are set. Use getRedis() before using. */
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis: Redis | null = createRedis(); 