const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redis = null;
let isRedisAvailable = false;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    enableOfflineQueue: false
  });

  redis.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ Connected to Redis Cache Cluster');
  });

  redis.on('error', (err) => {
    isRedisAvailable = false;
    // Silent fallback to direct database queries if Redis is offline
  });
} catch (e) {
  isRedisAvailable = false;
  console.log('⚠️ Redis client init fallback mode active.');
}

// Caching middleware with fallback
const cacheMiddleware = (ttlSeconds = 300) => async (req, res, next) => {
  if (req.method !== 'GET' || !isRedisAvailable || !redis) {
    return next();
  }

  const cacheKey = `borrow:cache:${req.originalUrl || req.url}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      res.setHeader('X-Cache-Status', 'HIT');
      return res.json(JSON.parse(cachedData));
    }
  } catch (err) {
    // If Redis error occurs, fallback to next handler
  }

  res.setHeader('X-Cache-Status', 'MISS');
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (isRedisAvailable && redis && res.statusCode >= 200 && res.statusCode < 300) {
      redis.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch(() => {});
    }
    return originalJson(body);
  };

  next();
};

// Purge cache keys matching pattern
const purgeCachePattern = async (pattern = 'borrow:cache:*') => {
  if (!isRedisAvailable || !redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 Purged ${keys.length} Redis cache keys matching pattern: ${pattern}`);
    }
  } catch (err) {
    console.error('Cache Purge Error:', err);
  }
};

module.exports = {
  cacheMiddleware,
  purgeCachePattern,
  redisClient: redis
};
