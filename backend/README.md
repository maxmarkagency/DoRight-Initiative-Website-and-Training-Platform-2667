# DoRight LMS Backend - Supabase Migration

This is the migrated backend for the DoRight Learning Management System, now using Supabase as the database and authentication provider.

## Migration Overview

### What Changed

1. **Database**: Migrated from direct PostgreSQL to Supabase PostgreSQL
2. **Authentication**: Now uses Supabase Auth instead of custom JWT implementation
3. **Real-time Features**: Can leverage Supabase real-time subscriptions
4. **API**: Simplified API with Supabase client integration
5. **Security**: Enhanced with Supabase Row Level Security (RLS)

### Key Benefits

- **Simplified Authentication**: Supabase handles user registration, login, email verification, password reset
- **Real-time Updates**: Built-in real-time subscriptions for live updates
- **Better Security**: Row Level Security policies ensure data access control
- **Reduced Complexity**: Less custom auth code to maintain
- **Scalability**: Supabase handles database scaling automatically

## Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Copy the URL, anon key, and service role key

### 2. Database Migration

1. In your Supabase dashboard, go to SQL Editor
2. Run the migration files in order:
   ```sql
   -- Run migrations/supabase/001_initial_schema.sql first
   -- Then run migrations/supabase/002_rls_policies.sql
   ```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 4. Email Configuration (Optional)

Supabase handles authentication emails by default, but you can customize them:
1. Go to Authentication > Settings in Supabase dashboard
2. Configure email templates and SMTP settings
3. Set up custom redirect URLs

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

All authentication is now handled through Supabase:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/password-reset-request` - Request password reset
- `POST /api/auth/update-password` - Update password
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/user` - Get current user

### Users

- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user profile
- `PATCH /api/users/me/email` - Update email (requires verification)
- `GET /api/users/:id` - Get user by ID (admin or self)
- `GET /api/users` - List users (admin only)
- `PATCH /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Deactivate user (admin only)

## Frontend Integration

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Update Authentication Context

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 4. Real-time Features

```javascript
// Example: Real-time course enrollments
useEffect(() => {
  const subscription = supabase
    .channel('enrollments')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'enrollments',
        filter: `course_id=eq.${courseId}`
      }, 
      (payload) => {
        console.log('New enrollment:', payload.new)
        // Update UI
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [courseId])
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Instructors can manage their own courses
- Admins have full access
- Public data (published courses) is accessible to everyone

### API Security

- All endpoints require proper authentication
- Role-based access control
- Rate limiting
- Input validation
- CORS protection

## Database Schema

The database schema remains largely the same as the original PostgreSQL version, with these additions:

1. **Users table** now references `auth.users(id)` from Supabase Auth
2. **RLS policies** ensure proper data access control
3. **Custom types** for better data validation
4. **Optimized indexes** for performance

## Deployment

### Supabase (Database)

Your Supabase project is automatically deployed and managed.

### Backend (API Server)

Deploy to any Node.js hosting platform:

1. **Vercel/Netlify**: For serverless deployment
2. **Railway/Render**: For traditional server deployment
3. **AWS/Google Cloud**: For enterprise deployment

### Environment Variables

Ensure these are set in production:

```env
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Migration from Original Backend

### Data Migration

If you have existing data in PostgreSQL:

1. Export data from your current database
2. Transform data to match new schema
3. Import data into Supabase using SQL or API

### Authentication Migration

Existing users will need to:
1. Reset their passwords (Supabase will handle this)
2. Verify their email addresses
3. Re-login with new system

### Code Changes Required

1. Replace database queries with Supabase client calls
2. Update authentication middleware
3. Implement RLS policies
4. Update frontend to use Supabase client

## Monitoring and Maintenance

### Supabase Dashboard

Monitor your application through the Supabase dashboard:
- Database performance
- API usage
- Authentication metrics
- Real-time connections

### Logging

The backend includes comprehensive logging:
- Request/response logging
- Error tracking
- Performance monitoring

### Backups

Supabase automatically handles:
- Daily database backups
- Point-in-time recovery
- High availability

## Support

For technical support:
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- DoRight Technical Team: tech@doright.ng