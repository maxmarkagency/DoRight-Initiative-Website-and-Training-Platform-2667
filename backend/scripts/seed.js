const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');

    await client.query('BEGIN');

    // Check if seeding has already been done
    const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', ['admin@doright.ng']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('📊 Database already seeded, skipping...');
      await client.query('ROLLBACK');
      return;
    }

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 12);
    const instructorPasswordHash = await bcrypt.hash('InstructorPassword123!', 12);
    const studentPasswordHash = await bcrypt.hash('StudentPassword123!', 12);

    // Insert default users
    console.log('👥 Creating default users...');
    
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, ['admin@doright.ng', adminPasswordHash, 'Admin', 'User', 'admin', true, true]);
    
    const instructorResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'instructor@doright.ng', 
      instructorPasswordHash, 
      'Dr. Amina', 
      'Hassan', 
      'instructor', 
      true, 
      true,
      'Former civil servant with 15 years of experience in public administration and governance reform.'
    ]);

    await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['student@doright.ng', studentPasswordHash, 'John', 'Doe', 'student', true, true]);

    const adminId = adminResult.rows[0].id;
    const instructorId = instructorResult.rows[0].id;

    // Insert default categories
    console.log('📚 Creating course categories...');
    
    const categories = [
      { name: 'Leadership', slug: 'leadership', description: 'Courses on leadership development and management skills' },
      { name: 'Integrity & Ethics', slug: 'integrity-ethics', description: 'Courses on integrity, ethics, and moral leadership' },
      { name: 'Civic Responsibility', slug: 'civic-responsibility', description: 'Courses on civic engagement and community service' },
      { name: 'Anti-Corruption', slug: 'anti-corruption', description: 'Courses on fighting corruption and promoting transparency' },
      { name: 'Youth Development', slug: 'youth-development', description: 'Courses specifically designed for young leaders' },
      { name: 'Community Building', slug: 'community-building', description: 'Courses on community engagement and development' }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const result = await client.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [category.name, category.slug, category.description]);
      categoryIds[category.slug] = result.rows[0].id;
    }

    // Insert sample courses
    console.log('🎓 Creating sample courses...');

    // Course 1: Foundations of Integrity
    const course1Result = await client.query(`
      INSERT INTO courses (title, slug, description, short_description, instructor_id, status, price, currency, difficulty_level, estimated_duration, language, requirements, learning_objectives, target_audience)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      'Foundations of Integrity',
      'foundations-of-integrity',
      'This comprehensive course covers the fundamental principles of integrity, ethics, and personal accountability. Students will learn practical applications of ethical decision-making in personal and professional contexts.',
      'Core values, ethics and personal accountability.',
      instructorId,
      'published',
      0.00,
      'NGN',
      'beginner',
      180,
      'en',
      ['Basic literacy', 'Commitment to personal growth'],
      ['Understand core integrity principles', 'Apply ethical decision-making frameworks', 'Develop personal accountability practices'],
      'Individuals seeking to build strong moral foundations'
    ]);

    // Course 2: Leadership & Civic Responsibility
    const course2Result = await client.query(`
      INSERT INTO courses (title, slug, description, short_description, instructor_id, status, price, currency, difficulty_level, estimated_duration, language, requirements, learning_objectives, target_audience)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      'Leadership & Civic Responsibility',
      'leadership-civic-responsibility',
      'Advanced course on ethical leadership and community engagement. Learn how to lead with integrity and mobilize communities for positive change.',
      'Leading with integrity; community service.',
      instructorId,
      'published',
      0.00,
      'NGN',
      'intermediate',
      240,
      'en',
      ['Completed Foundations of Integrity', 'Basic leadership experience'],
      ['Develop ethical leadership skills', 'Learn community mobilization techniques', 'Create sustainable change initiatives'],
      'Emerging leaders and community organizers'
    ]);

    const course1Id = course1Result.rows[0].id;
    const course2Id = course2Result.rows[0].id;

    // Associate courses with categories
    await client.query(`
      INSERT INTO course_categories (course_id, category_id) VALUES 
      ($1, $2), ($3, $4)
    `, [course1Id, categoryIds['integrity-ethics'], course2Id, categoryIds['leadership']]);

    // Create modules and lessons for Course 1
    console.log('📖 Creating course modules and lessons...');

    // Course 1 modules
    const module1Result = await client.query(`
      INSERT INTO modules (course_id, title, description, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [course1Id, 'Understanding Integrity', 'Introduction to integrity concepts and principles', 1]);

    const module2Result = await client.query(`
      INSERT INTO modules (course_id, title, description, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [course1Id, 'Practical Applications', 'Real-world applications of integrity in daily life', 2]);

    const module1Id = module1Result.rows[0].id;
    const module2Id = module2Result.rows[0].id;

    // Course 1 lessons
    await client.query(`
      INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position, is_preview)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8),
      ($9, $10, $11, $12, $13, $14, $15, $16),
      ($17, $18, $19, $20, $21, $22, $23, $24)
    `, [
      module1Id, 'What Is Integrity?', 'Defining integrity and its importance in personal and professional life', 'video', 
      JSON.stringify({ video_url: 'https://example.com/videos/what-is-integrity.mp4', transcript: 'Integrity is...' }), 
      480, 1, true,
      
      module1Id, 'Core Values Exercise', 'Interactive exercise to identify your core values', 'text',
      JSON.stringify({ html: '<h2>Core Values Exercise</h2><p>In this exercise, you will identify and prioritize your core values...</p>' }),
      300, 2, false,
      
      module2Id, 'Everyday Ethics', 'Applying ethical principles in daily decisions', 'video',
      JSON.stringify({ video_url: 'https://example.com/videos/everyday-ethics.mp4', transcript: 'Ethics in daily life...' }),
      720, 1, false
    ]);

    // Course 2 modules and lessons
    const module3Result = await client.query(`
      INSERT INTO modules (course_id, title, description, position)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [course2Id, 'Leadership Foundations', 'Core principles of ethical leadership', 1]);

    const module3Id = module3Result.rows[0].id;

    await client.query(`
      INSERT INTO lessons (module_id, title, description, content_type, content, duration_seconds, position)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      module3Id, 'Principles of Leadership', 'Fundamental principles of ethical leadership', 'video',
      JSON.stringify({ video_url: 'https://example.com/videos/leadership-principles.mp4', transcript: 'Leadership principles...' }),
      900, 1
    ]);

    // Insert default settings
    console.log('⚙️ Creating default settings...');
    
    const settings = [
      { key: 'site_name', value: '"DoRight Academy"', description: 'The name of the LMS site' },
      { key: 'site_description', value: '"Learn integrity, leadership, and civic responsibility"', description: 'Site description for SEO' },
      { key: 'primary_color', value: '"#005BBB"', description: 'Primary brand color' },
      { key: 'secondary_color', value: '"#FFC107"', description: 'Secondary brand color' },
      { key: 'default_currency', value: '"NGN"', description: 'Default currency for courses' },
      { key: 'allow_registration', value: 'true', description: 'Whether new user registration is allowed' },
      { key: 'require_email_verification', value: 'true', description: 'Whether email verification is required' },
      { key: 'enable_2fa', value: 'true', description: 'Whether 2FA is available for users' },
      { key: 'contact_email', value: '"info@doright.ng"', description: 'Contact email for support' },
      { key: 'contact_phone', value: '"+234 123 456 7890"', description: 'Contact phone number' }
    ];

    for (const setting of settings) {
      await client.query(`
        INSERT INTO settings (key, value, description, updated_by)
        VALUES ($1, $2, $3, $4)
      `, [setting.key, setting.value, setting.description, adminId]);
    }

    // Insert sample webhook
    await client.query(`
      INSERT INTO webhooks (url, events, secret, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'https://example.com/webhook/doright',
      ['user.registered', 'course.completed'],
      'webhook_secret_123',
      true,
      adminId
    ]);

    await client.query('COMMIT');

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('🔐 Default user accounts created:');
    console.log('   Admin: admin@doright.ng / AdminPassword123!');
    console.log('   Instructor: instructor@doright.ng / InstructorPassword123!');
    console.log('   Student: student@doright.ng / StudentPassword123!');
    console.log('');
    console.log('📚 Sample courses created:');
    console.log('   - Foundations of Integrity');
    console.log('   - Leadership & Civic Responsibility');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Handle command line execution
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🏁 Seeding process completed');
    process.exit(0);
  }).catch(err => {
    console.error('💥 Seeding process failed:', err);
    process.exit(1);
  }).finally(() => {
    pool.end();
  });
}

module.exports = { seedDatabase };