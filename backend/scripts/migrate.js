import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/migrations.log' })
  ]
});

async function ensureMigrationHistoryTable() {
  try {
    // Check if table exists first
    const { data, error: checkError } = await supabaseAdmin
      .from('migrations_history')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, we need to create it via SQL Editor
      logger.warn('⚠️  migrations_history table does not exist.');
      logger.warn('⚠️  Please run migrations manually via Supabase SQL Editor first.');
      logger.warn('⚠️  See TROUBLESHOOTING.md for instructions.');
      return false;
    }
    
    logger.info('✓ migrations_history table exists');
    return true;
  } catch (error) {
    logger.error('Error checking migrations_history table:', error.message);
    return false;
  }
}

async function getExecutedMigrations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('migrations_history')
      .select('filename');

    if (error) {
      if (error.code === '42P01') {
        logger.warn('migrations_history table does not exist yet');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    logger.warn('Could not fetch migration history:', error.message);
    return [];
  }
}

async function recordMigration(filename, status = 'completed', errorMessage = null) {
  try {
    const { error } = await supabaseAdmin
      .from('migrations_history')
      .insert({
        migration_id: filename.replace('.sql', ''),
        filename: filename,
        status: status,
        error_message: errorMessage,
        metadata: { auto_executed: true, timestamp: new Date().toISOString() }
      });
    if (error) {
      logger.warn(`Could not record migration ${filename}:`, error.message);
    }
  } catch (error) {
    logger.error(`Failed to record migration ${filename}:`, error.message);
  }
}

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      return false; // Table doesn't exist
    }
    return true; // Table exists
  } catch (error) {
    return false;
  }
}

export async function runMigrations() {
  try {
    logger.info('='.repeat(60));
    logger.info('Checking database schema...');
    logger.info('='.repeat(60));

    // Check if migrations_history table exists
    const historyTableExists = await ensureMigrationHistoryTable();
    
    // Check critical tables
    const criticalTables = ['users', 'courses', 'enrollments', 'modules', 'lessons', 'progress'];
    const missingTables = [];
    
    for (const tableName of criticalTables) {
      const exists = await checkTableExists(tableName);
      if (exists) {
        logger.info(`✓ Table '${tableName}' exists`);
      } else {
        logger.error(`✗ Table '${tableName}' does NOT exist`);
        missingTables.push(tableName);
      }
    }

    if (missingTables.length > 0) {
      logger.error('='.repeat(60));
      logger.error('❌ CRITICAL: Missing database tables!');
      logger.error('='.repeat(60));
      logger.error(`Missing tables: ${missingTables.join(', ')}`);
      logger.error('');
      logger.error('📋 To fix this, run migrations manually:');
      logger.error('');
      logger.error('Option 1: Via Supabase Dashboard (Recommended)');
      logger.error('  1. Go to: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/editor');
      logger.error('  2. Click "SQL Editor"');
      logger.error('  3. Copy and paste the contents of each file in order:');
      logger.error('     - backend/migrations/supabase/001_initial_schema.sql');
      logger.error('     - backend/migrations/supabase/002_rls_policies.sql');
      logger.error('     - backend/migrations/supabase/003_seed_default_users.sql');
      logger.error('  4. Click "Run" for each file');
      logger.error('');
      logger.error('Option 2: Via Command Line');
      logger.error('  npm run migrate:manual');
      logger.error('');
      logger.error('See TROUBLESHOOTING.md for detailed instructions.');
      logger.error('='.repeat(60));
      return false;
    }

    logger.info('='.repeat(60));
    logger.info('✅ All critical tables exist!');
    logger.info('='.repeat(60));
    
    // Try to get executed migrations
    if (historyTableExists) {
      const executedMigrations = await getExecutedMigrations();
      logger.info(`Found ${executedMigrations.length} previously executed migrations`);
    }

    return true;

  } catch (error) {
    logger.error('Migration check error:', error);
    return false;
  }
}

// For manual use
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then(() => {
    process.exit(0);
  }).catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export default runMigrations;