import { supabaseAdmin, getUserClient } from '../config/supabase.js'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

// Middleware to verify Supabase JWT token
export const authenticateSupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' })
    }

    if (!profile.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' })
    }

    // Attach user and client to request
    req.user = profile
    req.supabaseUser = user
    req.userClient = getUserClient(token)
    
    next()
  } catch (err) {
    logger.error('Auth middleware error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role]
    const requiredRoles = Array.isArray(roles) ? roles : [roles]

    const hasPermission = requiredRoles.some(role => userRoles.includes(role))

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const resourceUserId = req.params.userId || req.body[resourceUserIdField] || req.query.user_id

    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next()
    } else {
      return res.status(403).json({ error: 'Access denied' })
    }
  }
}

// Email verification required middleware
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({ 
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    })
  }
  next()
}

export default {
  authenticateSupabaseToken,
  requireRole,
  requireOwnershipOrAdmin,
  requireEmailVerification
}