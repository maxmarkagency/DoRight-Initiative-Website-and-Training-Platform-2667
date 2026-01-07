import { createClient } from '@supabase/supabase-js';
import { validateEnvVars } from '../utils/errorHandler';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const envValidation = validateEnvVars();

if (!envValidation.isValid) {
  console.error('❌ Supabase Configuration Error:', envValidation.message);
  console.error('Missing:', envValidation.missing.join(', '));
  console.warn('App will continue to load, but database features will not work.');
}

if (envValidation.isValid) {
  console.log('✓ Supabase environment variables validated');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'doright-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'doright-lms-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;