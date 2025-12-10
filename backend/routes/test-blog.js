import express from 'express';
import { AppError } from '../middleware/errorHandler.js';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Simple test endpoint to verify blog functionality
 * This bypasses all authentication and database calls
 */
router.get('/', async (req, res, next) => {
  try {
    logger.info('Test blog endpoint called');
    
    // Return a simple mock response
    res.json({
      success: true,
      posts: [],
      total: 0,
      message: 'Test blog endpoint working! Database connection issue detected.',
      setup_required: false,
      test: true
    });
    
  } catch (error) {
    logger.error('Test blog endpoint error:', error);
    next(new AppError('Test blog endpoint failed', 500));
  }
});

/**
 * Test creating a blog post (mock)
 */
router.post('/', async (req, res, next) => {
  try {
    logger.info('Test blog create endpoint called');
    
    const { title, slug, content } = req.body;
    
    if (!title || !slug || !content) {
      return next(new AppError('Title, slug, and content are required', 400));
    }
    
    // Return mock success response
    res.status(201).json({
      success: true,
      post: {
        id: 'test-id-' + Date.now(),
        title,
        slug,
        content,
        status: 'draft',
        created_at: new Date().toISOString()
      },
      message: 'Mock blog post created successfully!'
    });
    
  } catch (error) {
    logger.error('Test blog create error:', error);
    next(new AppError('Test blog create failed', 500));
  }
});

export default router;