export const handleSupabaseError = (error, context = '') => {
  if (!error) return null;

  console.error(`Supabase Error${context ? ` in ${context}` : ''}:`, error);

  const errorMessages = {
    'Invalid API key': 'Database connection error. Please check your configuration.',
    'relation': 'Database table not found. Please ensure migrations are applied.',
    'column': 'Database schema error. Please check table structure.',
    'JWT': 'Authentication error. Please log in again.',
    'RLS': 'Permission denied. You do not have access to this resource.',
    'PGRST': 'Database query error. Please try again.',
    'Network': 'Network error. Please check your internet connection.',
    'timeout': 'Request timed out. Please try again.',
    'duplicate key': 'This item already exists.',
    'foreign key': 'Cannot delete: this item is referenced elsewhere.',
    'not null': 'Required field is missing.',
  };

  let userMessage = 'An unexpected error occurred. Please try again.';

  const errorString = error.message || error.toString();

  for (const [key, message] of Object.entries(errorMessages)) {
    if (errorString.toLowerCase().includes(key.toLowerCase())) {
      userMessage = message;
      break;
    }
  }

  if (error.code === 'PGRST116') {
    userMessage = 'No data found.';
  } else if (error.code === '23505') {
    userMessage = 'This item already exists in the database.';
  } else if (error.code === '23503') {
    userMessage = 'Cannot complete this action due to related data.';
  } else if (error.code === '23502') {
    userMessage = 'Required information is missing.';
  } else if (error.code === '42P01') {
    userMessage = 'Database table not found. Please contact support.';
  } else if (error.code === '42703') {
    userMessage = 'Database column not found. Please contact support.';
  }

  return {
    message: userMessage,
    originalError: error,
    context
  };
};

export const showErrorToast = (error, context = '') => {
  const errorInfo = handleSupabaseError(error, context);
  console.error('Error:', errorInfo);
  return errorInfo.message;
};

export const withErrorHandling = async (asyncFunction, context = '') => {
  try {
    return await asyncFunction();
  } catch (error) {
    const errorInfo = handleSupabaseError(error, context);
    throw new Error(errorInfo.message);
  }
};

export const validateEnvVars = () => {
  const required = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    return {
      isValid: false,
      missing,
      message: `Missing required environment variables: ${missing.join(', ')}. Please check your .env file.`
    };
  }

  return {
    isValid: true,
    missing: [],
    message: 'All environment variables are configured.'
  };
};

export const isNetworkError = (error) => {
  const errorString = error?.message || error?.toString() || '';
  return (
    errorString.includes('network') ||
    errorString.includes('fetch') ||
    errorString.includes('offline') ||
    errorString.includes('timeout') ||
    error?.name === 'NetworkError'
  );
};

export const isAuthError = (error) => {
  const errorString = error?.message || error?.toString() || '';
  return (
    errorString.includes('JWT') ||
    errorString.includes('auth') ||
    errorString.includes('unauthorized') ||
    errorString.includes('forbidden') ||
    error?.status === 401 ||
    error?.status === 403
  );
};

export const retryWithBackoff = async (
  asyncFunction,
  maxRetries = 3,
  initialDelay = 1000
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFunction();
    } catch (error) {
      lastError = error;

      if (!isNetworkError(error) || i === maxRetries - 1) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
