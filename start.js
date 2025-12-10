/**
 * cPanel Node.js Application Startup Script
 * This file is used as the startup file for the Node.js application in cPanel
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get port from environment variable for cPanel compatibility
const PORT = process.env.PORT || 3000;

// Import the main backend application
import backendApp from './server.js';

// Create the main application for cPanel
const app = express();

// Security middleware
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));

// CORS configuration for production
import cors from 'cors';
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Serve static files from the dist directory (frontend build)
app.use(express.static(path.join(__dirname, 'dist')));

// API routes (served from the backend)
app.use('/api', backendApp);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// All other routes should serve the React app
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (!req.url.startsWith('/api/') && !req.url.startsWith('/uploads/')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

// Handle backend errors at the cPanel level
app.use((err, req, res, next) => {
  console.error('Backend Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 DoRight LMS Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export the app for testing purposes
export default app;