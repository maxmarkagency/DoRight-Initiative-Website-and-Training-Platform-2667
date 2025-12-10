import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Supabase client and test connection
import { testConnection } from './config/supabase.js';

// Import migration runner
import runMigrations from './scripts/migrate.js';

// Import user creation script
import createDefaultUsers from './scripts/createDefaultUsers.js';

// Import routes
import supabaseAuthRoutes from './routes/supabaseAuth.js';
import supabaseUserRoutes from './routes/supabaseUsers.js';
import migrationRoutes from './routes/migrations.js';
import adminBlogRoutes from './routes/adminBlog.js';
import adminGalleryRoutes from './routes/adminGallery.js';
import uploadRoutes from './routes/upload.js';
import cleanBlogRoutes from './routes/cleanBlog.js';
import publicBlogRoutes from './routes/publicBlog.js';
import blogRoutes from './routes/blog.js';
import testBlogRoutes from './routes/test-blog.js';
import galleryRoutes from './routes/gallery.js';

// Import error handler
import { errorHandler } from './middleware/errorHandler.js';

// Setup Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - support multiple origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    if (allowedOrigins.some(allowed => origin.startsWith(allowed)) || 
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'DoRight LMS Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', supabaseAuthRoutes);
app.use('/api/users', supabaseUserRoutes);
app.use('/api/migrations', migrationRoutes);
app.use('/api/admin/blog', adminBlogRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/clean/blog', cleanBlogRoutes);
app.use('/api/public/blog', publicBlogRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/test-blog', testBlogRoutes);
app.use('/api/gallery', galleryRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Initialize server
async function startServer() {
  try {
    logger.info('🚀 Starting DoRight LMS Backend...');
    
    // Test Supabase connection
    logger.info('📡 Testing Supabase connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      logger.warn('⚠️  Supabase connection test failed, but continuing...');
    }

    // Run migrations if AUTO_RUN_MIGRATIONS is true
    if (process.env.AUTO_RUN_MIGRATIONS === 'true') {
      logger.info('🔄 Running database migrations...');
      try {
        await runMigrations();
        logger.info('✅ Migrations completed successfully');
      } catch (error) {
        logger.error('❌ Migration error:', error.message);
        logger.warn('⚠️  Continuing despite migration errors...');
      }
    }

    // Create default users if they don't exist
    logger.info('👥 Checking/creating default users...');
    try {
      await createDefaultUsers();
      logger.info('✅ Default users ready');
    } catch (error) {
      logger.error('❌ Error creating default users:', error.message);
      logger.warn('⚠️  You may need to run: npm run create-users');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Frontend URL: ${allowedOrigins.join(', ')}`);
      logger.info('='.repeat(60));
      logger.info('\n📝 To test the API, try:');
      logger.info(`   curl http://localhost:${PORT}/health\n`);
    });

  } catch (error) {
    logger.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;