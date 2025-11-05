const redis = require('redis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Redis client configuration
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server refused the connection');
      return new Error('Redis server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max attempts reached');
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Redis event handlers
client.on('connect', () => {
  logger.info('Connected to Redis server');
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

client.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await client.connect();
    return true;
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
    return false;
  }
};

// Redis helper functions
const redisHelpers = {
  // Set with expiration
  setex: async (key, seconds, value) => {
    try {
      return await client.setEx(key, seconds, JSON.stringify(value));
    } catch (err) {
      logger.error('Redis SETEX error:', err);
      throw err;
    }
  },

  // Get and parse JSON
  get: async (key) => {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.error('Redis GET error:', err);
      throw err;
    }
  },

  // Delete key
  del: async (key) => {
    try {
      return await client.del(key);
    } catch (err) {
      logger.error('Redis DEL error:', err);
      throw err;
    }
  },

  // Set with no expiration
  set: async (key, value) => {
    try {
      return await client.set(key, JSON.stringify(value));
    } catch (err) {
      logger.error('Redis SET error:', err);
      throw err;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      return await client.exists(key);
    } catch (err) {
      logger.error('Redis EXISTS error:', err);
      throw err;
    }
  },

  // Increment counter
  incr: async (key) => {
    try {
      return await client.incr(key);
    } catch (err) {
      logger.error('Redis INCR error:', err);
      throw err;
    }
  },

  // Set expiration
  expire: async (key, seconds) => {
    try {
      return await client.expire(key, seconds);
    } catch (err) {
      logger.error('Redis EXPIRE error:', err);
      throw err;
    }
  }
};

module.exports = {
  client,
  connectRedis,
  ...redisHelpers
};