import { supabaseAdmin } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const defaultUsers = [
  {
    email: 'admin@doright.ng',
    password: 'AdminPassword123!',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    bio: 'System Administrator'
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
    role: 'student',
    bio: 'Eager to learn about public service and governance'
  }
];

async function createDefaultUsers() {
  logger.info('🚀 Starting default user creation process...\n');

  // Check if service role key is set
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    logger.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set!');
    logger.error('Please get your service role key from:');
    logger.error('https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/settings/api');
    process.exit(1);
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of defaultUsers) {
    try {
      logger.info(`\n📧 Processing user: ${userData.email}`);

      // Check if user already exists in auth
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        logger.error(`❌ Error listing users: ${listError.message}`);
        errorCount++;
        continue;
      }

      const existingUser = existingUsers.users.find(u => u.email === userData.email);

      let authUserId;

      if (existingUser) {
        logger.info(`ℹ️  User ${userData.email} already exists in Supabase Auth`);
        authUserId = existingUser.id;
        skipCount++;
      } else {
        // Create user in Supabase Auth
        logger.info(`🔐 Creating auth user for ${userData.email}...`);
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
          logger.error(`❌ Error creating auth user ${userData.email}: ${authError.message}`);
          errorCount++;
          continue;
        }

        authUserId = authData.user.id;
        logger.info(`✅ Created auth user with ID: ${authUserId}`);
      }

      // Check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single();

      if (existingProfile) {
        logger.info(`ℹ️  User profile already exists, updating...`);
      } else {
        logger.info(`📝 Creating user profile...`);
      }

      // Create or update user profile in users table
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authUserId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          bio: userData.bio,
          is_active: true,
          is_email_verified: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        logger.error(`❌ Error creating/updating profile for ${userData.email}: ${profileError.message}`);
        errorCount++;
      } else {
        logger.info(`✅ Successfully created/updated user profile`);
        successCount++;
      }

    } catch (error) {
      logger.error(`❌ Unexpected error creating user ${userData.email}:`, error.message);
      errorCount++;
    }
  }

  // Summary
  logger.info('\n' + '='.repeat(60));
  logger.info('📊 USER CREATION SUMMARY');
  logger.info('='.repeat(60));
  logger.info(`✅ Successfully created/updated: ${successCount}`);
  logger.info(`⏭️  Skipped (already exist): ${skipCount}`);
  logger.info(`❌ Errors: ${errorCount}`);
  logger.info('='.repeat(60));

  if (successCount > 0 || skipCount > 0) {
    logger.info('\n🎉 DEFAULT LOGIN CREDENTIALS:');
    logger.info('─'.repeat(60));
    logger.info('👨‍💼 Admin Account:');
    logger.info('   Email:    admin@doright.ng');
    logger.info('   Password: AdminPassword123!');
    logger.info('');
    logger.info('👩‍🏫 Instructor Account:');
    logger.info('   Email:    instructor@doright.ng');
    logger.info('   Password: InstructorPassword123!');
    logger.info('');
    logger.info('👨‍🎓 Student Account:');
    logger.info('   Email:    student@doright.ng');
    logger.info('   Password: StudentPassword123!');
    logger.info('─'.repeat(60));
    logger.info('');
    logger.info('⚠️  SECURITY WARNING:');
    logger.info('   Please change these passwords in production!');
    logger.info('');
  }

  return { successCount, skipCount, errorCount };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultUsers()
    .then(({ successCount, errorCount }) => {
      if (errorCount > 0) {
        logger.error('\n❌ Script completed with errors');
        process.exit(1);
      } else {
        logger.info('\n✅ Script completed successfully!');
        process.exit(0);
      }
    })
    .catch(error => {
      logger.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

export default createDefaultUsers;