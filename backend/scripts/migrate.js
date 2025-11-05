const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get list of applied migrations
    const appliedResult = await pool.query('SELECT filename FROM migrations ORDER BY filename');
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.filename));

    // Get list of migration files
    const files = await fs.readdir(MIGRATIONS_DIR);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('📁 No migration files found.');
      return;
    }

    let appliedCount = 0;

    for (const filename of migrationFiles) {
      if (appliedMigrations.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already applied)`);
        continue;
      }

      console.log(`📄 Applying migration: ${filename}`);

      try {
        // Read migration file
        const filePath = path.join(MIGRATIONS_DIR, filename);
        const sql = await fs.readFile(filePath, 'utf8');

        // Execute migration in a transaction
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          // Execute the migration SQL
          await client.query(sql);
          
          // Record the migration as applied
          await client.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [filename]
          );
          
          await client.query('COMMIT');
          console.log(`✅ Applied migration: ${filename}`);
          appliedCount++;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } catch (err) {
        console.error(`❌ Failed to apply migration ${filename}:`, err.message);
        process.exit(1);
      }
    }

    if (appliedCount === 0) {
      console.log('✨ Database is up to date (no new migrations to apply)');
    } else {
      console.log(`🎉 Successfully applied ${appliedCount} migration(s)`);
    }

  } catch (err) {
    console.error('💥 Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle command line execution
if (require.main === module) {
  runMigrations().then(() => {
    console.log('🏁 Migration process completed');
    process.exit(0);
  }).catch(err => {
    console.error('💥 Migration process failed:', err);
    process.exit(1);
  });
}

module.exports = { runMigrations };