import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Manual Migration Script
 * 
 * This script outputs the SQL migrations that need to be run manually
 * in the Supabase SQL Editor.
 */

async function outputMigrations() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('MANUAL MIGRATION INSTRUCTIONS');
    console.log('='.repeat(80));
    console.log('\nFollow these steps to set up your database:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('   https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/editor\n');
    console.log('2. Click on "SQL Editor" in the left sidebar\n');
    console.log('3. Copy and paste each SQL block below into the SQL Editor\n');
    console.log('4. Click "Run" after pasting each block\n');
    console.log('5. Run them IN ORDER (001, 002, 003)\n');
    console.log('='.repeat(80));

    const migrationsDir = path.join(__dirname, '../migrations/supabase');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

    for (const filename of sqlFiles) {
      const filePath = path.join(migrationsDir, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      
      console.log('\n\n' + '▼'.repeat(80));
      console.log(`MIGRATION FILE: ${filename}`);
      console.log('▼'.repeat(80));
      console.log('\n' + content);
      console.log('\n' + '▲'.repeat(80));
      console.log(`END OF: ${filename}`);
      console.log('▲'.repeat(80));
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('After running all migrations, restart your backend server:');
    console.log('  cd backend');
    console.log('  npm run dev');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error reading migration files:', error);
    process.exit(1);
  }
}

outputMigrations();