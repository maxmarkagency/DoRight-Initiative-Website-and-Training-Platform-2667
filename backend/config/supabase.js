import { createClient } from '@supabase/supabase-js'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
})

// Supabase configuration
const supabaseUrl = 'https://jqekzavaerbxjzyeihvv.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZWt6YXZhZXJieGp6eWVpaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTUxNjIsImV4cCI6MjA2OTk5MTE2Mn0.IuHqn-LqcaqRyP9AgIP7khq6hjfZ6oH-wOpe3PdYIIc'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Admin client with service role key (for server operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client for user operations (with anon key)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user client with token
export const getUserClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // Table doesn't exist is OK
      throw error
    }
    
    logger.info('Supabase connection test successful')
    return true
  } catch (err) {
    logger.error('Supabase connection test failed:', err)
    return false
  }
}

// Query helper function
export const query = async (table, operation = 'select', options = {}) => {
  try {
    let queryBuilder = supabaseAdmin.from(table)
    
    switch (operation) {
      case 'select':
        queryBuilder = queryBuilder.select(options.select || '*')
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value)
          })
        }
        if (options.limit) queryBuilder = queryBuilder.limit(options.limit)
        if (options.order) queryBuilder = queryBuilder.order(options.order.column, { ascending: options.order.ascending })
        break
        
      case 'insert':
        queryBuilder = queryBuilder.insert(options.data)
        if (options.select) queryBuilder = queryBuilder.select(options.select)
        break
        
      case 'update':
        queryBuilder = queryBuilder.update(options.data)
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value)
          })
        }
        if (options.select) queryBuilder = queryBuilder.select(options.select)
        break
        
      case 'delete':
        if (options.eq) {
          Object.entries(options.eq).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value)
          })
        }
        queryBuilder = queryBuilder.delete()
        break
    }
    
    const { data, error } = await queryBuilder
    
    if (error) throw error
    
    logger.debug('Supabase query executed successfully', { table, operation })
    return { data, error: null }
  } catch (err) {
    logger.error('Supabase query error', { table, operation, error: err.message })
    return { data: null, error: err }
  }
}

export default supabaseAdmin