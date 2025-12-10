import { supabaseAdmin, getUserClient } from '../config/supabase.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to authenticate Supabase JWT token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Try to get user profile from database, but make it optional for now
    let profile = null;
    try {
      const { data, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && data) {
        profile = data;
        
        if (!profile.is_active) {
          throw new AppError('Account is deactivated', 403);
        }
      }
    } catch (e) {
      // If users table doesn't exist or has permission issues, continue without profile
      console.log('Warning: Could not fetch user profile:', e.message);
    }

    // Attach user info to request
    // Use Supabase user data as fallback if profile not found
    req.user = profile || {
      id: user.id,
      email: user.email,
      role: 'admin', // Default role for now
      is_active: true
    };
    req.userId = user.id;
    req.userClient = getUserClient(token);

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Aliases for compatibility
export const authenticateSupabaseToken = authenticateToken;

/**
 * Middleware to require ownership or admin access
 */
export const requireOwnershipOrAdmin = (getResourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const resourceUserId = getResourceUserId(req);
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Owner can access their own resources
    if (req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });
  };
};