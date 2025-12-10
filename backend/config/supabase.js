import { createClient } from '@supabase/supabase-js';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://jqekzavaerbxjzyeihvv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZWt6YXZhZXJieGp6eWVpaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTUxNjIsImV4cCI6MjA2OTk5MTE2Mn0.IuHqn-LqcaqRyP9AgIP7khq6hjfZ6oH-wOpe3PdYIIc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!supabaseServiceKey) {
  logger.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Admin operations may fail.');
  logger.warn('⚠️  Get your service role key from: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/settings/api');
}

// Admin client with service role key (for server operations)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Client for user operations (with anon key)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Aliases for compatibility
export const adminClient = supabaseAdmin;
export const userClient = supabaseClient;

// Helper function to get user client with token
export const getUserClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Test Supabase connection
export const testConnection = async () => {
  try {
    // Test basic connection by checking if we can query a system table
    const { data, error } = await supabaseAdmin
      .rpc('version');
    
    if (error) {
      throw error;
    }
    
    logger.info('✓ Supabase connection test successful');
    return true;
  } catch (err) {
    logger.error('✗ Supabase connection test failed:', err.message);
    return false;
  }
};

export default supabaseAdmin;