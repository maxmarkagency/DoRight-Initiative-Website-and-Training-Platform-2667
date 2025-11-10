import { supabaseAdmin } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const DEFAULT_USERS = [
  {
    email: 'admin@doright.ng',
    password: 'AdminPassword123!',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin'
  },
  {
    email: 'instructor@doright.ng',
    password: 'InstructorPassword123!',
    first_name: 'Dr. Amina',
    last_name: 'Hassan',
    role: 'instructor',
    bio: 'Former civil servant with 15 years of experience in public administration and governance reform.'
  },
  {
    email: 'student@doright.ng',
    password: 'StudentPassword123!',
    first_name: 'John',
    last_name: 'Doe',
    role: 'student'
  }
];

async function createUser(userData) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      logger.info(`User ${userData.email} already exists, skipping...`);
      return;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email for default users
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      }
    });

    if (authError) {
      logger.error(`Failed to create auth user ${userData.email}:`, authError);
      return;
    }

    logger.info(`✓ Created auth user: ${userData.email}`);

    // Create user profile in database
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        is_active: true,
        is_email_verified: true,
        bio: userData.bio || null
      });

    if (profileError) {
      logger.error(`Failed to create user profile ${userData.email}:`, profileError);
      // Try to cleanup auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return;
    }

    logger.info(`✓ Created user profile: ${userData.email}`);
    logger.info(`  Password: ${userData.password}`);
    
  } catch (error) {
    logger.error(`Error creating user ${userData.email}:`, error);
  }
}

async function createDefaultUsers() {
  logger.info('Creating default users...\n');

  for (const userData of DEFAULT_USERS) {
    await createUser(userData);
  }

  logger.info('\n=== Default User Credentials ===');
  logger.info('Admin:');
  logger.info(`  Email: admin@doright.ng`);
  logger.info(`  Password: AdminPassword123!`);
  logger.info('\nInstructor:');
  logger.info(`  Email: instructor@doright.ng`);
  logger.info(`  Password: InstructorPassword123!`);
  logger.info('\nStudent:');
  logger.info(`  Email: student@doright.ng`);
  logger.info(`  Password: StudentPassword123!`);
  logger.info('================================\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultUsers()
    .then(() => {
      logger.info('User creation completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('User creation failed:', error);
      process.exit(1);
    });
}

export { createDefaultUsers };