import { createClient } from '@supabase/supabase-js';
import { validateEnvVars } from '../utils/errorHandler';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const envValidation = validateEnvVars();

if (!envValidation.isValid) {
  console.error('❌ Supabase Configuration Error:', envValidation.message);
  console.error('Missing:', envValidation.missing.join(', '));
  throw new Error(envValidation.message);
}

console.log('✓ Supabase environment variables validated');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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