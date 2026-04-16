/**
 * CacheService — Redis-backed caching for ride search results.
 * Gracefully falls back to no-cache if Redis is not available.
 * Reconnection is intentionally disabled to avoid log spam in dev.
 */

let redis = null;
let redisChecked = false;

function initRedis() {
  if (redisChecked) return;
  redisChecked = true;

  try {
    const Redis = require('ioredis');
    const client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // disable auto-retry — we handle gracefully
      enableOfflineQueue: false,
    });

    client.once('error', () => {
      console.warn('[CacheService] Redis not available — running without cache (no impact on functionality).');
      client.disconnect();
      redis = null;
    });

    client.connect()
      .then(() => {
        console.log('[CacheService] Redis connected ✓');
        redis = client;
      })
      .catch(() => {
        console.warn('[CacheService] Redis not available — running without cache (no impact on functionality).');
        redis = null;
      });
  } catch {
    console.warn('[CacheService] ioredis not installed — skipping cache.');
  }
}

// Initialise once on module load
initRedis();

const DEFAULT_TTL = 60;

async function get(key) {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function set(key, value, ttl = DEFAULT_TTL) {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // silently fail
  }
}

async function del(key) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // silently fail
  }
}

function buildSearchKey(params) {
  const { pickupLat, pickupLng, dropLat, dropLng, date, seats } = params;
  return `ride_search:${pickupLat}:${pickupLng}:${dropLat}:${dropLng}:${date}:${seats || 1}`;
}

module.exports = { get, set, del, buildSearchKey };
