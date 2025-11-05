const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console()
  ]
});

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const message = 'Duplicate entry';
    error = new AppError(message, 400, 'DUPLICATE_ENTRY');
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced record not found';
    error = new AppError(message, 400, 'FOREIGN_KEY_VIOLATION');
  }

  if (err.code === '23502') { // Not null violation
    const message = 'Required field missing';
    error = new AppError(message, 400, 'REQUIRED_FIELD_MISSING');
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new AppError(message, 400, 'UNEXPECTED_FILE');
  }

  // Payment errors
  if (err.type === 'StripeCardError') {
    const message = err.message;
    error = new AppError(message, 400, 'PAYMENT_ERROR');
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = new AppError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    code: error.code || null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error helper
const validationError = (message, field = null) => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    error.field = field;
  }
  return error;
};

// Authorization error helper
const authError = (message = 'Access denied') => {
  return new AppError(message, 403, 'ACCESS_DENIED');
};

// Authentication error helper
const unauthenticatedError = (message = 'Authentication required') => {
  return new AppError(message, 401, 'AUTHENTICATION_REQUIRED');
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
  validationError,
  authError,
  unauthenticatedError
};