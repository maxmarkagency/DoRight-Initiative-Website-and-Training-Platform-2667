const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { get: redisGet } = require('../config/redis');

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if token is blacklisted
  const isBlacklisted = await redisGet(`blacklist:${token}`);
  if (isBlacklisted) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }

  const decoded = verifyToken(token, process.env.JWT_SECRET);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Get user from database
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, is_email_verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Authorization middleware for roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    const hasPermission = requiredRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceUserId = req.params.userId || req.body[resourceUserIdField] || req.query.user_id;
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  };
};

// Verify email required middleware
const requireEmailVerification = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

// Rate limiting for specific users
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const key = `rate_limit:${req.user.id}:${Math.floor(Date.now() / windowMs)}`;
    
    try {
      const { incr, expire } = require('../config/redis');
      const requests = await incr(key);
      
      if (requests === 1) {
        await expire(key, Math.ceil(windowMs / 1000));
      }

      if (requests > maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - requests),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs)
      });

      next();
    } catch (err) {
      console.error('Rate limiting error:', err);
      next(); // Continue on Redis error
    }
  };
};

module.exports = {
  generateTokens,
  verifyToken,
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
  requireEmailVerification,
  userRateLimit
};