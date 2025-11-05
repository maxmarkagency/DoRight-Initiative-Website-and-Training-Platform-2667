import express from 'express'
import { supabaseAdmin, supabaseClient } from '../config/supabase.js'
import { authenticateSupabaseToken } from '../middleware/supabaseAuth.js'
import { asyncHandler, AppError, validationError } from '../middleware/errorHandler.js'
import { validateEmail, validatePassword } from '../utils/validation.js'
import winston from 'winston'

const router = express.Router()
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, role = 'student' } = req.body

  // Validation
  if (!email || !password || !first_name || !last_name) {
    throw validationError('All fields are required')
  }

  if (!validateEmail(email)) {
    throw validationError('Invalid email format')
  }

  if (!validatePassword(password)) {
    throw validationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
  }

  // Valid roles
  const validRoles = ['student', 'instructor', 'admin', 'staff']
  if (!validRoles.includes(role)) {
    throw validationError('Invalid role')
  }

  try {
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: false, // We'll handle email verification
      user_metadata: {
        first_name,
        last_name,
        role
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw validationError('User already exists with this email')
      }
      throw new AppError(authError.message, 400)
    }

    // Create user profile in database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        first_name,
        last_name,
        role,
        is_active: true,
        is_email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new AppError('Failed to create user profile', 500)
    }

    // Send email verification
    const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    })

    if (emailError) {
      logger.warn('Failed to send verification email:', emailError)
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role
      }
    })
  } catch (error) {
    logger.error('Registration error:', error)
    throw error
  }
}))

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw validationError('Email and password are required')
  }

  try {
    // Sign in with Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (error) {
      throw validationError('Invalid email or password')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      throw validationError('User profile not found')
    }

    if (!profile.is_active) {
      throw validationError('Account is deactivated')
    }

    res.json({
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: profile
    })
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}))

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    throw validationError('Refresh token is required')
  }

  try {
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token
    })

    if (error) {
      throw validationError('Invalid refresh token')
    }

    // Get updated user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || !profile.is_active) {
      throw validationError('User not found or inactive')
    }

    res.json({
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: profile
    })
  } catch (error) {
    logger.error('Token refresh error:', error)
    throw error
  }
}))

// Logout
router.post('/logout', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  try {
    const { error } = await req.userClient.auth.signOut()
    
    if (error) {
      logger.warn('Logout error:', error)
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    logger.error('Logout error:', error)
    throw error
  }
}))

// Password reset request
router.post('/password-reset-request', asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw validationError('Email is required')
  }

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    })

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.'
    })
  } catch (error) {
    logger.error('Password reset request error:', error)
    // Still return success for security
    res.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.'
    })
  }
}))

// Update password
router.post('/update-password', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  const { password } = req.body

  if (!password) {
    throw validationError('New password is required')
  }

  if (!validatePassword(password)) {
    throw validationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
  }

  try {
    const { error } = await req.userClient.auth.updateUser({
      password
    })

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    logger.error('Password update error:', error)
    throw error
  }
}))

// Get current user
router.get('/user', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
}))

// Verify email
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token_hash, type } = req.body

  if (!token_hash) {
    throw validationError('Verification token is required')
  }

  try {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      token_hash,
      type: type || 'signup'
    })

    if (error) {
      throw validationError('Invalid or expired verification token')
    }

    // Update user profile to mark email as verified
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        is_email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    if (updateError) {
      logger.error('Failed to update email verification status:', updateError)
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    logger.error('Email verification error:', error)
    throw error
  }
}))

// Resend verification email
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw validationError('Email is required')
  }

  try {
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    })

    res.json({
      success: true,
      message: 'Verification email sent'
    })
  } catch (error) {
    logger.error('Resend verification error:', error)
    res.json({
      success: true,
      message: 'Verification email sent'
    })
  }
}))

export default router