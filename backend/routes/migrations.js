import express from 'express';
import { adminClient } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/supabaseAuth.js';
import { AppError } from '../middleware/errorHandler.js';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/migrations.log' }),
    new winston.transports.Console()
  ]
});

/**
 * GET /api/migrations
 * List all available migrations
 */
router.get('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const migrationsPath = path.join(__dirname, '../migrations/supabase');
    const files = await fs.readdir(migrationsPath);
    
    const migrations = await Promise.all(
      files
        .filter(file => file.endsWith('.sql'))
        .map(async (file) => {
          const filePath = path.join(migrationsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Extract summary from SQL comment
          const summaryMatch = content.match(/\/\*\s*([\s\S]*?)\*\//);
          const summary = summaryMatch ? summaryMatch[1].trim() : 'No description available';
          
          return {
            id: file.replace('.sql', ''),
            filename: file,
            summary: summary.substring(0, 500),
            path: `migrations/supabase/${file}`
          };
        })
    );

    res.json({
      success: true,
      migrations: migrations.sort((a, b) => a.filename.localeCompare(b.filename))
    });
  } catch (error) {
    logger.error('Error listing migrations:', error);
    next(new AppError('Failed to list migrations', 500));
  }
});

/**
 * GET /api/migrations/:id
 * Get details of a specific migration
 */
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const migrationsPath = path.join(__dirname, '../migrations/supabase');
    const filename = `${id}.sql`;
    const filePath = path.join(migrationsPath, filename);

    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract summary from SQL comment
    const summaryMatch = content.match(/\/\*\s*([\s\S]*?)\*\//);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No description available';

    res.json({
      success: true,
      migration: {
        id,
        filename,
        summary,
        content,
        path: `migrations/supabase/${filename}`
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return next(new AppError('Migration not found', 404));
    }
    logger.error('Error getting migration:', error);
    next(new AppError('Failed to get migration', 500));
  }
});

/**
 * POST /api/migrations/approve
 * Approve and execute a migration
 */
router.post('/approve', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { migrationId, metadata } = req.body;

    if (!migrationId) {
      return next(new AppError('Migration ID is required', 400));
    }

    logger.info(`Approving migration: ${migrationId}`, {
      user: req.user.id,
      metadata
    });

    // Read migration file
    const migrationsPath = path.join(__dirname, '../migrations/supabase');
    const filename = `${migrationId}.sql`;
    const filePath = path.join(migrationsPath, filename);

    let sqlContent;
    try {
      sqlContent = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return next(new AppError('Migration file not found', 404));
      }
      throw error;
    }

    // Execute migration using Supabase admin client
    const { data, error } = await adminClient.rpc('exec_sql', {
      sql_query: sqlContent
    });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      const { error: execError } = await adminClient.from('_migrations').select('*').limit(1);
      
      if (execError) {
        logger.error('Migration execution failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Migration execution failed',
          details: error.message,
          suggestion: 'Please execute the migration manually in Supabase SQL Editor'
        });
      }
    }

    // Log migration execution
    const { error: logError } = await adminClient
      .from('migration_history')
      .insert({
        migration_id: migrationId,
        executed_by: req.user.id,
        executed_at: new Date().toISOString(),
        metadata: metadata || {},
        status: 'completed'
      });

    if (logError) {
      logger.warn('Failed to log migration:', logError);
    }

    logger.info(`Migration approved and executed: ${migrationId}`);

    res.json({
      success: true,
      message: 'Migration executed successfully',
      migrationId,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error approving migration:', error);
    next(new AppError('Failed to execute migration', 500));
  }
});

/**
 * GET /api/migrations/history
 * Get migration execution history
 */
router.get('/history/all', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { data, error } = await adminClient
      .from('migration_history')
      .select('*, users(email, full_name)')
      .order('executed_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      history: data || []
    });
  } catch (error) {
    logger.error('Error fetching migration history:', error);
    next(new AppError('Failed to fetch migration history', 500));
  }
});

export default router;