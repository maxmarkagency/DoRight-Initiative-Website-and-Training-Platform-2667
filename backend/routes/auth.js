const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { query, transaction } = require('../config/database');
const { setex, del, get } = require('../config/redis');
const { generateTokens, verifyToken, authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { validateEmail, validatePassword } = require('../utils/validation');

const router = express.Router();

// Register new user
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, role = 'student' } = req.body;

  // Validation
  if (!email || !password || !first_name || !last_name) {
    throw validationError('All fields are required');
  }

  if (!validateEmail(email)) {
    throw validationError('Invalid email format');
  }

  if (!validatePassword(password)) {
    throw validationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  // Valid roles
  const validRoles = ['student', 'instructor', 'admin', 'staff'];
  if (!validRoles.includes(role)) {
    throw validationError('Invalid role');
  }

  // Check if user exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingUser.rows.length > 0) {
    throw validationError('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, email_verification_token)
     VALUES ($1, $2, $3, $4, $5, false, $6)
     RETURNING id, email, first_name, last_name, role, created_at`,
    [email.toLowerCase(), hashedPassword, first_name, last_name, role, verificationToken]
  );

  const user = result.rows[0];

  // Store verification token in Redis (expires in 24 hours)
  await setex(`email_verification:${verificationToken}`, 24 * 60 * 60, { userId: user.id, email: user.email });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your email for DoRight Academy',
    template: 'verification',
    data: {
      first_name: user.first_name,
      verification_url: verificationUrl
    }
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
  });
}));

// Verify email
router.get('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw validationError('Verification token is required');
  }

  // Get token data from Redis
  const tokenData = await get(`email_verification:${token}`);
  if (!tokenData) {
    throw validationError('Invalid or expired verification token');
  }

  // Update user email verification status
  await query(
    'UPDATE users SET is_email_verified = true, email_verification_token = NULL WHERE id = $1',
    [tokenData.userId]
  );

  // Remove token from Redis
  await del(`email_verification:${token}`);

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, totp_code } = req.body;

  if (!email || !password) {
    throw validationError('Email and password are required');
  }

  // Get user with password
  const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, role, is_active, is_email_verified, twofa_secret FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw validationError('Invalid email or password');
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    throw validationError('Account is deactivated');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw validationError('Invalid email or password');
  }

  // Check 2FA if enabled
  if (user.twofa_secret) {
    if (!totp_code) {
      return res.status(200).json({
        success: true,
        requires_2fa: true,
        message: '2FA code required'
      });
    }

    const isValid2FA = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: totp_code,
      window: 2
    });

    if (!isValid2FA) {
      throw validationError('Invalid 2FA code');
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Store refresh token in database
  const deviceInfo = req.get('User-Agent') || 'Unknown';
  const ipAddress = req.ip;

  await query(
    `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, refreshToken, deviceInfo, ipAddress, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
  );

  // Remove password from user object
  delete user.password_hash;
  delete user.twofa_secret;

  res.json({
    success: true,
    access_token: accessToken,
    refresh_token: refreshToken,
    user
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw validationError('Refresh token is required');
  }

  // Verify refresh token
  const decoded = verifyToken(refresh_token, process.env.JWT_REFRESH_SECRET);
  if (!decoded) {
    throw validationError('Invalid refresh token');
  }

  // Check if refresh token exists in database and is not revoked
  const tokenResult = await query(
    'SELECT id, user_id, revoked, expires_at FROM refresh_tokens WHERE token = $1',
    [refresh_token]
  );

  if (tokenResult.rows.length === 0 || tokenResult.rows[0].revoked) {
    throw validationError('Invalid refresh token');
  }

  const tokenRecord = tokenResult.rows[0];

  // Check if token is expired
  if (new Date() > new Date(tokenRecord.expires_at)) {
    await query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [tokenRecord.id]);
    throw validationError('Refresh token expired');
  }

  // Get user
  const userResult = await query(
    'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1',
    [tokenRecord.user_id]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
    throw validationError('User not found or inactive');
  }

  const user = userResult.rows[0];

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Revoke old refresh token and create new one
  await transaction(async (client) => {
    await client.query('UPDATE refresh_tokens SET revoked = true WHERE id = $1', [tokenRecord.id]);
    
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, newRefreshToken, req.get('User-Agent'), req.ip, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    );
  });

  res.json({
    success: true,
    access_token: accessToken,
    refresh_token: newRefreshToken,
    user
  });
}));

// Logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  // Revoke refresh token if provided
  if (refresh_token) {
    await query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [refresh_token]);
  }

  // Add access token to blacklist (Redis)
  if (accessToken) {
    const decoded = verifyToken(accessToken, process.env.JWT_SECRET);
    if (decoded) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await setex(`blacklist:${accessToken}`, expiresIn, true);
      }
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Password reset request
router.post('/password-reset-request', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw validationError('Email is required');
  }

  // Check if user exists
  const result = await query('SELECT id, first_name FROM users WHERE email = $1', [email.toLowerCase()]);
  
  // Always return success to prevent email enumeration
  if (result.rows.length === 0) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.'
    });
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store reset token in Redis (expires in 1 hour)
  await setex(`password_reset:${resetToken}`, 60 * 60, { userId: user.id, email });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password - DoRight Academy',
    template: 'password-reset',
    data: {
      first_name: user.first_name,
      reset_url: resetUrl
    }
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, we sent a password reset link.'
  });
}));

// Password reset
router.post('/password-reset', asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    throw validationError('Token and new password are required');
  }

  if (!validatePassword(new_password)) {
    throw validationError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  // Get token data from Redis
  const tokenData = await get(`password_reset:${token}`);
  if (!tokenData) {
    throw validationError('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

  // Update password and revoke all refresh tokens
  await transaction(async (client) => {
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, tokenData.userId]
    );

    await client.query(
      'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1',
      [tokenData.userId]
    );
  });

  // Remove reset token from Redis
  await del(`password_reset:${token}`);

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// Enable 2FA
router.post('/2fa/enable', authenticateToken, asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `DoRight Academy (${req.user.email})`,
    issuer: 'DoRight Academy'
  });

  // Store temporary secret in Redis (expires in 10 minutes)
  await setex(`2fa_setup:${req.user.id}`, 10 * 60, { secret: secret.base32 });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    secret: secret.base32,
    qr_code: qrCodeUrl,
    backup_codes: [] // TODO: Generate backup codes
  });
}));

// Verify and confirm 2FA setup
router.post('/2fa/verify', authenticateToken, asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw validationError('2FA code is required');
  }

  // Get temporary secret from Redis
  const setupData = await get(`2fa_setup:${req.user.id}`);
  if (!setupData) {
    throw validationError('2FA setup session expired. Please start over.');
  }

  // Verify the code
  const isValid = speakeasy.totp.verify({
    secret: setupData.secret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!isValid) {
    throw validationError('Invalid 2FA code');
  }

  // Save secret to user account
  await query('UPDATE users SET twofa_secret = $1 WHERE id = $2', [setupData.secret, req.user.id]);

  // Remove setup data from Redis
  await del(`2fa_setup:${req.user.id}`);

  res.json({
    success: true,
    message: '2FA enabled successfully'
  });
}));

// Disable 2FA
router.post('/2fa/disable', authenticateToken, asyncHandler(async (req, res) => {
  const { code, password } = req.body;

  if (!code || !password) {
    throw validationError('2FA code and password are required');
  }

  // Get user with password and 2FA secret
  const result = await query(
    'SELECT password_hash, twofa_secret FROM users WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw validationError('Invalid password');
  }

  // Verify 2FA code
  const isValid2FA = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (!isValid2FA) {
    throw validationError('Invalid 2FA code');
  }

  // Disable 2FA
  await query('UPDATE users SET twofa_secret = NULL WHERE id = $1', [req.user.id]);

  res.json({
    success: true,
    message: '2FA disabled successfully'
  });
}));

// Get user's 2FA status
router.get('/2fa/status', authenticateToken, asyncHandler(async (req, res) => {
  const result = await query('SELECT twofa_secret FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];

  res.json({
    success: true,
    enabled: !!user.twofa_secret
  });
}));

module.exports = router;