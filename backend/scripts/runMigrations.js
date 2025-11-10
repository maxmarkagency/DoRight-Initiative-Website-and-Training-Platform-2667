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

// Ensure migrations_history table exists
async function ensureMigrationHistoryTable() {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        migration_id TEXT UNIQUE NOT NULL,
        filename TEXT NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        executed_by UUID,
        status TEXT DEFAULT 'completed',
        error_message TEXT,
        metadata JSONB
      );
      
      CREATE INDEX IF NOT EXISTS idx_migrations_history_migration_id 
      ON migrations_history(migration_id);
    `;

    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (error) {
      // Try direct query if RPC doesn't exist
      logger.warn('RPC exec_sql not available, attempting direct table check');
      
      // Check if table exists
      const { data, error: checkError } = await supabaseAdmin
        .from('migrations_history')
        .select('id')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        logger.error('migrations_history table does not exist. Please create it manually in Supabase SQL Editor.');
        logger.info('SQL to create table:\n' + createTableSQL);
      }
    } else {
      logger.info('✓ migrations_history table ready');
    }
  } catch (error) {
    logger.warn('Could not ensure migrations_history table:', error.message);
  }
}

// Get list of executed migrations
async function getExecutedMigrations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('migrations_history')
      .select('migration_id, filename, executed_at')
      .order('executed_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
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

// Record migration execution
async function recordMigration(migrationId, filename, status = 'completed', errorMessage = null) {
  try {
    const { error } = await supabaseAdmin
      .from('migrations_history')
      .insert({
        migration_id: migrationId,
        filename: filename,
        status: status,
        error_message: errorMessage,
        metadata: {
          auto_executed: true,
          timestamp: new Date().toISOString()
        }
      });

    if (error) throw error;
    logger.info(`✓ Recorded migration: ${migrationId}`);
  } catch (error) {
    logger.error(`Failed to record migration ${migrationId}:`, error.message);
  }
}

// Execute a single SQL migration
async function executeMigration(migrationPath, migrationId, filename) {
  try {
    logger.info(`Executing migration: ${filename}`);
    
    // Read SQL file
    const sqlContent = await fs.readFile(migrationPath, 'utf-8');
    
    // Remove comments and split by semicolons for individual statements
    const statements = sqlContent
      .split(/;\s*$/gm)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        // Try using RPC first
        const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', {
          sql: statement
        });

        if (rpcError) {
          // If RPC fails, try direct query (for SELECT-like operations)
          logger.warn(`RPC failed for statement ${i + 1}, attempting direct execution`);
          
          // For CREATE/ALTER/DROP statements, we need to use the SQL editor
          if (statement.match(/^(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE)/i)) {
            logger.error(`Cannot execute DDL/DML statement directly. Please run in Supabase SQL Editor:`);
            logger.error(statement.substring(0, 200) + '...');
            throw new Error('DDL/DML requires SQL Editor execution');
          }
        }
      } catch (stmtError) {
        logger.error(`Error in statement ${i + 1}:`, stmtError.message);
        throw stmtError;
      }
    }

    logger.info(`✓ Successfully executed: ${filename}`);
    await recordMigration(migrationId, filename, 'completed');
    return true;
  } catch (error) {
    logger.error(`✗ Failed to execute ${filename}:`, error.message);
    await recordMigration(migrationId, filename, 'failed', error.message);
    return false;
  }
}

// Main migration runner
export async function runMigrations() {
  try {
    logger.info('='.repeat(60));
    logger.info('Starting automatic migration process');
    logger.info('='.repeat(60));

    // Ensure migration history table exists
    await ensureMigrationHistoryTable();

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.migration_id));

    logger.info(`Found ${executedMigrations.length} previously executed migrations`);

    // Get migration files
    const migrationsDir = path.join(__dirname, '../migrations/supabase');
    let files;
    
    try {
      files = await fs.readdir(migrationsDir);
    } catch (error) {
      logger.error('Migrations directory not found:', migrationsDir);
      return;
    }

    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Alphabetical order ensures correct execution

    logger.info(`Found ${sqlFiles.length} migration files`);

    // Filter out already executed migrations
    const pendingMigrations = sqlFiles.filter(file => {
      const migrationId = file.replace('.sql', '');
      return !executedIds.has(migrationId);
    });

    if (pendingMigrations.length === 0) {
      logger.info('✓ No pending migrations. Database is up to date!');
      logger.info('='.repeat(60));
      return;
    }

    logger.info(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => logger.info(`  - ${file}`));
    logger.info('');

    // Execute pending migrations
    let successCount = 0;
    let failCount = 0;

    for (const filename of pendingMigrations) {
      const migrationId = filename.replace('.sql', '');
      const migrationPath = path.join(migrationsDir, filename);

      const success = await executeMigration(migrationPath, migrationId, filename);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
        logger.warn('Migration failed, stopping execution to prevent cascading errors');
        break;
      }
    }

    logger.info('');
    logger.info('='.repeat(60));
    logger.info('Migration Summary:');
    logger.info(`  ✓ Successful: ${successCount}`);
    logger.info(`  ✗ Failed: ${failCount}`);
    logger.info(`  - Skipped: ${sqlFiles.length - pendingMigrations.length}`);
    logger.info('='.repeat(60));

    if (failCount > 0) {
      logger.error('Some migrations failed. Please check the logs and run failed migrations manually in Supabase SQL Editor.');
    }

  } catch (error) {
    logger.error('Migration process error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('Migration process completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runMigrations;