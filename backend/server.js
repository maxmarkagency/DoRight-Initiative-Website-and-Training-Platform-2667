import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Import Supabase configuration
import { testConnection } from './config/supabase.js'

// Import routes
import supabaseAuthRoutes from './routes/supabaseAuth.js'
import supabaseUserRoutes from './routes/supabaseUsers.js'
// Import other routes as needed

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
})

app.use(limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check endpoint
app.get('/health', async (req, res) => {
  const supabaseHealthy = await testConnection()
  
  res.status(supabaseHealthy ? 200 : 503).json({
    status: supabaseHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: supabaseHealthy ? 'connected' : 'disconnected'
  })
})

// API Routes
app.use('/api/auth', authLimiter, supabaseAuthRoutes)
app.use('/api/users', supabaseUserRoutes)

// Additional routes would be imported and used here
// app.use('/api/courses', courseRoutes)
// app.use('/api/enrollments', enrollmentRoutes)
// app.use('/api/progress', progressRoutes)
// etc.

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, async () => {
  logger.info(`DoRight LMS Backend (Supabase) running on port ${PORT}`)
  
  // Test Supabase connection
  const isConnected = await testConnection()
  if (isConnected) {
    logger.info('Successfully connected to Supabase')
  } else {
    logger.error('Failed to connect to Supabase')
  }
})

export default app