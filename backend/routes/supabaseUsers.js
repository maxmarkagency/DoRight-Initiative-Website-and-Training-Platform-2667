import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { authenticateSupabaseToken, requireRole, requireOwnershipOrAdmin } from '../middleware/supabaseAuth.js'
import { asyncHandler, validationError } from '../middleware/errorHandler.js'
import { validateEmail } from '../utils/validation.js'

const router = express.Router()

// Get current user profile
router.get('/me', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  // Get user statistics
  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select('status')
    .eq('user_id', req.user.id)

  const { data: certificates } = await supabaseAdmin
    .from('certificates')
    .select('id')
    .eq('user_id', req.user.id)

  const { data: progress } = await supabaseAdmin
    .from('progress')
    .select('completed')
    .eq('user_id', req.user.id)
    .eq('completed', true)

  const stats = {
    enrolled_courses: enrollments?.filter(e => e.status === 'active').length || 0,
    completed_courses: enrollments?.filter(e => e.status === 'completed').length || 0,
    certificates_earned: certificates?.length || 0,
    lessons_completed: progress?.length || 0
  }

  res.json({
    success: true,
    user: {
      ...req.user,
      stats
    }
  })
}))

// Update current user profile
router.patch('/me', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  const { first_name, last_name, bio, phone, timezone } = req.body

  // Validation
  if (first_name && (first_name.length < 1 || first_name.length > 50)) {
    throw validationError('First name must be between 1 and 50 characters')
  }

  if (last_name && (last_name.length < 1 || last_name.length > 50)) {
    throw validationError('Last name must be between 1 and 50 characters')
  }

  if (bio && bio.length > 500) {
    throw validationError('Bio must be less than 500 characters')
  }

  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
    throw validationError('Invalid phone number format')
  }

  // Build update object
  const updates = {
    updated_at: new Date().toISOString()
  }

  if (first_name !== undefined) updates.first_name = first_name
  if (last_name !== undefined) updates.last_name = last_name
  if (bio !== undefined) updates.bio = bio
  if (phone !== undefined) updates.phone = phone
  if (timezone !== undefined) updates.timezone = timezone

  if (Object.keys(updates).length === 1) { // Only updated_at
    throw validationError('No valid fields to update')
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update profile')
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: data
  })
}))

// Update email (requires verification)
router.patch('/me/email', authenticateSupabaseToken, asyncHandler(async (req, res) => {
  const { new_email } = req.body

  if (!new_email) {
    throw validationError('New email is required')
  }

  if (!validateEmail(new_email)) {
    throw validationError('Invalid email format')
  }

  // Check if email is already in use
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', new_email.toLowerCase())
    .neq('id', req.user.id)
    .single()

  if (existingUser) {
    throw validationError('Email is already in use')
  }

  try {
    // Update email with Supabase Auth (will send confirmation email)
    const { error } = await req.userClient.auth.updateUser({
      email: new_email.toLowerCase()
    })

    if (error) {
      throw new Error(error.message)
    }

    res.json({
      success: true,
      message: 'Verification email sent to your new email address. Please check your inbox.'
    })
  } catch (error) {
    throw new Error('Failed to update email')
  }
}))

// Get user by ID (admin or self)
router.get('/:id', authenticateSupabaseToken, requireOwnershipOrAdmin(), asyncHandler(async (req, res) => {
  const { id } = req.params

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, is_email_verified, created_at, updated_at, profile_picture, bio, phone, timezone')
    .eq('id', id)
    .single()

  if (error || !user) {
    throw validationError('User not found')
  }

  // Get user statistics if admin or self
  if (req.user.role === 'admin' || req.user.id === id) {
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('status')
      .eq('user_id', id)

    const { data: certificates } = await supabaseAdmin
      .from('certificates')
      .select('id')
      .eq('user_id', id)

    const { data: progress } = await supabaseAdmin
      .from('progress')
      .select('completed')
      .eq('user_id', id)
      .eq('completed', true)

    user.stats = {
      enrolled_courses: enrollments?.filter(e => e.status === 'active').length || 0,
      completed_courses: enrollments?.filter(e => e.status === 'completed').length || 0,
      certificates_earned: certificates?.length || 0,
      lessons_completed: progress?.length || 0
    }
  }

  res.json({
    success: true,
    user
  })
}))

// List users (admin only)
router.get('/', authenticateSupabaseToken, requireRole(['admin', 'staff']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    role, 
    search, 
    is_active, 
    sort_by = 'created_at', 
    sort_order = 'desc' 
  } = req.query

  const offset = (page - 1) * limit

  // Build query
  let query = supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name, role, is_active, is_email_verified, created_at, updated_at', { count: 'exact' })

  // Apply filters
  if (role) {
    query = query.eq('role', role)
  }

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true')
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // Apply sorting
  const validSortColumns = ['created_at', 'email', 'first_name', 'last_name', 'role']
  const validSortOrders = ['asc', 'desc']

  if (!validSortColumns.includes(sort_by) || !validSortOrders.includes(sort_order)) {
    throw validationError('Invalid sort parameters')
  }

  query = query
    .order(sort_by, { ascending: sort_order === 'asc' })
    .range(offset, offset + parseInt(limit) - 1)

  const { data: users, error, count } = await query

  if (error) {
    throw new Error('Failed to fetch users')
  }

  const totalPages = Math.ceil(count / limit)

  res.json({
    success: true,
    users,
    pagination: {
      current_page: parseInt(page),
      total_pages: totalPages,
      total_users: count,
      per_page: parseInt(limit),
      has_next: page < totalPages,
      has_prev: page > 1
    }
  })
}))

// Update user (admin only)
router.patch('/:id', authenticateSupabaseToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params
  const { first_name, last_name, role, is_active } = req.body

  // Validate role if provided
  if (role) {
    const validRoles = ['student', 'instructor', 'admin', 'staff']
    if (!validRoles.includes(role)) {
      throw validationError('Invalid role')
    }
  }

  // Build update object
  const updates = {
    updated_at: new Date().toISOString()
  }

  if (first_name !== undefined) updates.first_name = first_name
  if (last_name !== undefined) updates.last_name = last_name
  if (role !== undefined) updates.role = role
  if (is_active !== undefined) updates.is_active = is_active

  if (Object.keys(updates).length === 1) { // Only updated_at
    throw validationError('No valid fields to update')
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id, email, first_name, last_name, role, is_active, updated_at')
    .single()

  if (error || !data) {
    throw validationError('User not found')
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    user: data
  })
}))

// Deactivate user (admin only)
router.delete('/:id', authenticateSupabaseToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw validationError('Cannot delete your own account')
  }

  // Check if user exists
  const { data: user, error: checkError } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('id', id)
    .single()

  if (checkError || !user) {
    throw validationError('User not found')
  }

  // Soft delete - deactivate instead of hard delete to preserve data integrity
  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to deactivate user')
  }

  res.json({
    success: true,
    message: 'User deactivated successfully'
  })
}))

// Get user enrollments
router.get('/:id/enrollments', authenticateSupabaseToken, requireOwnershipOrAdmin(), asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('enrollments')
    .select(`
      id, status, enrolled_at, completed_at,
      courses (
        id, title, description, thumbnail_url, price, currency,
        users!courses_instructor_id_fkey (first_name, last_name)
      )
    `)
    .eq('user_id', id)
    .order('enrolled_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: enrollments, error } = await query

  if (error) {
    throw new Error('Failed to fetch enrollments')
  }

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const { data: progress } = await supabaseAdmin
        .from('progress')
        .select('lesson_id, completed')
        .eq('user_id', id)
        .eq('completed', true)

      const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('id')
        .in('module_id', 
          await supabaseAdmin
            .from('modules')
            .select('id')
            .eq('course_id', enrollment.courses.id)
            .then(res => res.data?.map(m => m.id) || [])
        )

      const completedLessons = progress?.length || 0
      const totalLessons = lessons?.length || 0
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      return {
        ...enrollment,
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        progress_percentage: progressPercentage
      }
    })
  )

  res.json({
    success: true,
    enrollments: enrollmentsWithProgress
  })
}))

export default router