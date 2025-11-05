const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middleware/auth');
const { asyncHandler, validationError } = require('../middleware/errorHandler');
const { validateEmail, validatePassword } = require('../utils/validation');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, email, first_name, last_name, role, is_active, is_email_verified, 
     created_at, updated_at, profile_picture, bio, phone, timezone
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw validationError('User not found');
  }

  const user = result.rows[0];

  // Get user statistics
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'active') as enrolled_courses,
      (SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'completed') as completed_courses,
      (SELECT COUNT(*) FROM certificates WHERE user_id = $1) as certificates_earned,
      (SELECT COUNT(*) FROM progress WHERE user_id = $1 AND completed = true) as lessons_completed
  `;

  const statsResult = await query(statsQuery, [req.user.id]);
  const stats = statsResult.rows[0];

  res.json({
    success: true,
    user: {
      ...user,
      stats: {
        enrolled_courses: parseInt(stats.enrolled_courses),
        completed_courses: parseInt(stats.completed_courses),
        certificates_earned: parseInt(stats.certificates_earned),
        lessons_completed: parseInt(stats.lessons_completed)
      }
    }
  });
}));

// Update current user profile
router.patch('/me', authenticateToken, asyncHandler(async (req, res) => {
  const { first_name, last_name, bio, phone, timezone } = req.body;

  // Validate input
  if (first_name && (first_name.length < 1 || first_name.length > 50)) {
    throw validationError('First name must be between 1 and 50 characters');
  }

  if (last_name && (last_name.length < 1 || last_name.length > 50)) {
    throw validationError('Last name must be between 1 and 50 characters');
  }

  if (bio && bio.length > 500) {
    throw validationError('Bio must be less than 500 characters');
  }

  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
    throw validationError('Invalid phone number format');
  }

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (first_name !== undefined) {
    updates.push(`first_name = $${paramCount++}`);
    values.push(first_name);
  }

  if (last_name !== undefined) {
    updates.push(`last_name = $${paramCount++}`);
    values.push(last_name);
  }

  if (bio !== undefined) {
    updates.push(`bio = $${paramCount++}`);
    values.push(bio);
  }

  if (phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }

  if (timezone !== undefined) {
    updates.push(`timezone = $${paramCount++}`);
    values.push(timezone);
  }

  if (updates.length === 0) {
    throw validationError('No valid fields to update');
  }

  updates.push(`updated_at = NOW()`);
  values.push(req.user.id);

  const updateQuery = `
    UPDATE users 
    SET ${updates.join(', ')} 
    WHERE id = $${paramCount}
    RETURNING id, email, first_name, last_name, role, bio, phone, timezone, updated_at
  `;

  const result = await query(updateQuery, values);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: result.rows[0]
  });
}));

// Change password
router.patch('/me/password', authenticateToken, asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw validationError('Current password and new password are required');
  }

  if (!validatePassword(new_password)) {
    throw validationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  // Get user's current password
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];

  // Verify current password
  const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
  if (!isValidPassword) {
    throw validationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Update password and revoke all refresh tokens
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, req.user.id]);
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [req.user.id]);

  res.json({
    success: true,
    message: 'Password updated successfully. Please log in again.'
  });
}));

// Update email (requires verification)
router.patch('/me/email', authenticateToken, asyncHandler(async (req, res) => {
  const { new_email, password } = req.body;

  if (!new_email || !password) {
    throw validationError('New email and password are required');
  }

  if (!validateEmail(new_email)) {
    throw validationError('Invalid email format');
  }

  // Check if email is already in use
  const existingUser = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [new_email.toLowerCase(), req.user.id]);
  if (existingUser.rows.length > 0) {
    throw validationError('Email is already in use');
  }

  // Verify password
  const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
  if (!isValidPassword) {
    throw validationError('Invalid password');
  }

  // Generate verification token
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Store pending email change in Redis
  const { setex } = require('../config/redis');
  await setex(`email_change:${verificationToken}`, 24 * 60 * 60, {
    userId: req.user.id,
    newEmail: new_email.toLowerCase(),
    oldEmail: req.user.email
  });

  // Send verification email to new address
  const { sendEmail } = require('../utils/email');
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email-change?token=${verificationToken}`;
  
  await sendEmail({
    to: new_email,
    subject: 'Verify your new email address - DoRight Academy',
    template: 'email-change',
    data: {
      first_name: req.user.first_name,
      verification_url: verificationUrl,
      old_email: req.user.email
    }
  });

  res.json({
    success: true,
    message: 'Verification email sent to your new email address. Please check your inbox.'
  });
}));

// Confirm email change
router.post('/me/email/verify', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw validationError('Verification token is required');
  }

  // Get token data from Redis
  const { get, del } = require('../config/redis');
  const tokenData = await get(`email_change:${token}`);
  if (!tokenData) {
    throw validationError('Invalid or expired verification token');
  }

  // Update user email
  await query(
    'UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2',
    [tokenData.newEmail, tokenData.userId]
  );

  // Remove token from Redis
  await del(`email_change:${token}`);

  res.json({
    success: true,
    message: 'Email updated successfully'
  });
}));

// Get user by ID (admin or self)
router.get('/:id', authenticateToken, requireOwnershipOrAdmin(), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, email, first_name, last_name, role, is_active, is_email_verified,
     created_at, updated_at, profile_picture, bio, phone, timezone
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw validationError('User not found');
  }

  const user = result.rows[0];

  // Get user statistics if admin or self
  if (req.user.role === 'admin' || req.user.id === id) {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'active') as enrolled_courses,
        (SELECT COUNT(*) FROM enrollments WHERE user_id = $1 AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM certificates WHERE user_id = $1) as certificates_earned,
        (SELECT COUNT(*) FROM progress WHERE user_id = $1 AND completed = true) as lessons_completed
    `;

    const statsResult = await query(statsQuery, [id]);
    const stats = statsResult.rows[0];

    user.stats = {
      enrolled_courses: parseInt(stats.enrolled_courses),
      completed_courses: parseInt(stats.completed_courses),
      certificates_earned: parseInt(stats.certificates_earned),
      lessons_completed: parseInt(stats.lessons_completed)
    };
  }

  res.json({
    success: true,
    user
  });
}));

// List users (admin only)
router.get('/', authenticateToken, requireRole(['admin', 'staff']), asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    role, 
    search, 
    is_active, 
    sort_by = 'created_at', 
    sort_order = 'desc' 
  } = req.query;

  const offset = (page - 1) * limit;

  // Build WHERE clause
  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (role) {
    conditions.push(`role = $${paramCount++}`);
    values.push(role);
  }

  if (is_active !== undefined) {
    conditions.push(`is_active = $${paramCount++}`);
    values.push(is_active === 'true');
  }

  if (search) {
    conditions.push(`(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
    values.push(`%${search}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort parameters
  const validSortColumns = ['created_at', 'email', 'first_name', 'last_name', 'role'];
  const validSortOrders = ['asc', 'desc'];

  if (!validSortColumns.includes(sort_by) || !validSortOrders.includes(sort_order)) {
    throw validationError('Invalid sort parameters');
  }

  // Get users
  const usersQuery = `
    SELECT id, email, first_name, last_name, role, is_active, is_email_verified, created_at, updated_at
    FROM users 
    ${whereClause}
    ORDER BY ${sort_by} ${sort_order.toUpperCase()}
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(parseInt(limit), offset);

  const usersResult = await query(usersQuery, values);

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
  const countResult = await query(countQuery, values.slice(0, -2)); // Remove limit and offset

  const totalUsers = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalUsers / limit);

  res.json({
    success: true,
    users: usersResult.rows,
    pagination: {
      current_page: parseInt(page),
      total_pages: totalPages,
      total_users: totalUsers,
      per_page: parseInt(limit),
      has_next: page < totalPages,
      has_prev: page > 1
    }
  });
}));

// Update user (admin only)
router.patch('/:id', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, role, is_active } = req.body;

  // Validate role if provided
  if (role) {
    const validRoles = ['student', 'instructor', 'admin', 'staff'];
    if (!validRoles.includes(role)) {
      throw validationError('Invalid role');
    }
  }

  // Build update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (first_name !== undefined) {
    updates.push(`first_name = $${paramCount++}`);
    values.push(first_name);
  }

  if (last_name !== undefined) {
    updates.push(`last_name = $${paramCount++}`);
    values.push(last_name);
  }

  if (role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(role);
  }

  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  if (updates.length === 0) {
    throw validationError('No valid fields to update');
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const updateQuery = `
    UPDATE users 
    SET ${updates.join(', ')} 
    WHERE id = $${paramCount}
    RETURNING id, email, first_name, last_name, role, is_active, updated_at
  `;

  const result = await query(updateQuery, values);

  if (result.rows.length === 0) {
    throw validationError('User not found');
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    user: result.rows[0]
  });
}));

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw validationError('Cannot delete your own account');
  }

  // Check if user exists
  const userResult = await query('SELECT id, email FROM users WHERE id = $1', [id]);
  if (userResult.rows.length === 0) {
    throw validationError('User not found');
  }

  // Soft delete - deactivate instead of hard delete to preserve data integrity
  await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// Get user enrollments
router.get('/:id/enrollments', authenticateToken, requireOwnershipOrAdmin(), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;

  let statusFilter = '';
  const values = [id];

  if (status) {
    statusFilter = 'AND e.status = $2';
    values.push(status);
    values.push(parseInt(limit), offset);
  } else {
    values.push(parseInt(limit), offset);
  }

  const enrollmentsQuery = `
    SELECT 
      e.id, e.status, e.enrolled_at, e.completed_at,
      c.id as course_id, c.title, c.description, c.thumbnail_url,
      c.price, c.currency,
      u.first_name as instructor_first_name, u.last_name as instructor_last_name,
      (SELECT COUNT(*) FROM progress p 
       JOIN lessons l ON p.lesson_id = l.id 
       JOIN modules m ON l.module_id = m.id 
       WHERE m.course_id = c.id AND p.user_id = e.user_id AND p.completed = true) as completed_lessons,
      (SELECT COUNT(*) FROM lessons l 
       JOIN modules m ON l.module_id = m.id 
       WHERE m.course_id = c.id) as total_lessons
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN users u ON c.instructor_id = u.id
    WHERE e.user_id = $1 ${statusFilter}
    ORDER BY e.enrolled_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const result = await query(enrollmentsQuery, values);

  // Calculate progress for each enrollment
  const enrollments = result.rows.map(enrollment => ({
    ...enrollment,
    progress_percentage: enrollment.total_lessons > 0 
      ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100) 
      : 0
  }));

  res.json({
    success: true,
    enrollments
  });
}));

module.exports = router;