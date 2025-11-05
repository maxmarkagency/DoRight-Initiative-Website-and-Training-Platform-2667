import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jqekzavaerbxjzyeihvv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZWt6YXZhZXJieGp6eWVpaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTUxNjIsImV4cCI6MjA2OTk5MTE2Mn0.IuHqn-LqcaqRyP9AgIP7khq6hjfZ6oH-wOpe3PdYIIc'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})