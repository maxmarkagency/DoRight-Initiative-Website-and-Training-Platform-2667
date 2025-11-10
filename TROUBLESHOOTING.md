# Troubleshooting Guide - DoRight LMS

This guide helps you resolve common issues in the DoRight Learning Management System.

---

## 🔴 **CRITICAL ERROR**: "Could not find the table 'public.enrollments' in the schema cache"

### **What This Means**
Your database tables don't exist yet. The backend cannot automatically create them because Supabase requires SQL migrations to be run through the SQL Editor for security.

### **Quick Fix (5 minutes)**

See **[QUICK_FIX.md](./QUICK_FIX.md)** for the fastest solution!

### **Detailed Solution**

#### **Step 1: Access Supabase SQL Editor**

1. Go to your Supabase Dashboard
2. Navigate to: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/sql
3. Or click **"SQL Editor"** in the left sidebar

#### **Step 2: Run Migration 001 - Initial Schema**

1. Click **"+ New query"**
2. Open the file: `backend/migrations/supabase/001_initial_schema.sql`
3. Copy **ALL** content (it's about 450 lines)
4. Paste into the SQL Editor
5. Click **"Run"** (bottom right) or press **Ctrl+Enter**
6. Wait for "Success. No rows returned" message

**What this creates:**
- All database tables (users, courses, enrollments, modules, lessons, progress, etc.)
- Custom types (user roles, course status, etc.)
- Indexes for performance
- Triggers for timestamps

#### **Step 3: Run Migration 002 - RLS Policies**

1. Click **"+ New query"** again
2. Open the file: `backend/migrations/supabase/002_rls_policies.sql`
3. Copy **ALL** content
4. Paste into the SQL Editor
5. Click **"Run"**

**What this creates:**
- Row Level Security (RLS) policies
- Ensures users can only see their own data
- Gives instructors access to their courses
- Gives admins access to everything

#### **Step 4: Run Migration 003 - Seed Data**

1. Click **"+ New query"** again
2. Open the file: `backend/migrations/supabase/003_seed_default_users.sql`
3. Copy **ALL** content
4. Paste and click **"Run"**

**What this creates:**
- Helper function for creating user profiles

#### **Step 5: Create Default Users**

Now that the database is ready, create the default user accounts:

```bash
cd backend
npm run create-users
```

You should see:
```
✅ Successfully created admin@doright.ng
✅ Successfully created instructor@doright.ng
✅ Successfully created student@doright.ng
```

#### **Step 6: Verify Setup**

1. **Check Tables:**
   - Go to Supabase Dashboard → **Database** → **Tables**
   - You should see: `users`, `courses`, `enrollments`, `modules`, `lessons`, `progress`, `quizzes`, `assignments`, `certificates`, etc.

2. **Check Users:**
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - You should see 3 users with emails: admin@doright.ng, instructor@doright.ng, student@doright.ng

3. **Check User Profiles:**
   - Go to Supabase Dashboard → **Database** → **Table Editor** → **users** table
   - You should see 3 rows with proper roles (admin, instructor, student)

#### **Step 7: Restart Backend**

```bash
cd backend
npm run dev
```

You should see:
```
✓ Table 'users' exists
✓ Table 'courses' exists
✓ Table 'enrollments' exists
✓ Table 'modules' exists
✓ Table 'lessons' exists
✓ Table 'progress' exists
✅ All critical tables exist!
```

#### **Step 8: Test the Application**

1. Open your browser: http://localhost:5173
2. Click **"Login"**
3. Use test credentials:
   - Email: `student@doright.ng`
   - Password: `Student@123`
4. You should be logged in successfully!

---

## 🔴 Login Issues

### Error: "Invalid login credentials"

This error occurs when:
- The user doesn't exist in Supabase Auth
- The password is incorrect
- The Service Role Key is missing or incorrect

#### **Solution:**

**Step 1: Verify Service Role Key**

1. Go to Supabase Dashboard → **Settings** → **API**
2. Scroll to **Project API keys**
3. Copy the **service_role** key (NOT the anon key!)
4. Update `backend/.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-service-role-key
   ```

**Step 2: Verify Email Confirmation is Disabled**

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Scroll to **Email Settings**
3. Ensure **"Confirm email"** is **DISABLED** (toggle should be OFF)
4. If it was enabled, disable it and save

**Step 3: Create Default Users**

```bash
cd backend
npm run create-users
```

**Step 4: Test Login**

Try logging in with these credentials:

- **Admin:**
  - Email: `admin@doright.ng`
  - Password: `Admin@123`

- **Instructor:**
  - Email: `instructor@doright.ng`
  - Password: `Instructor@123`

- **Student:**
  - Email: `student@doright.ng`
  - Password: `Student@123`

**Step 5: Check Browser Console**

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab for failed requests

---

## 🔴 Connection Issues

### Error: "Failed to fetch" or "Network error"

#### **Solution:**

**1. Check Backend Server:**

```bash
cd backend
npm run dev
```

Server should start on `http://localhost:4000` (or the port in your .env)

**2. Test Backend Health:**

Open in browser: `http://localhost:4000/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-01-06T...",
  "service": "DoRight LMS Backend",
  "version": "1.0.0"
}
```

**3. Check Frontend Configuration:**

Verify `src/lib/supabase.js` has correct credentials:
```javascript
const SUPABASE_URL = 'https://jqekzavaerbxjzyeihvv.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

**4. Check CORS:**

Verify `backend/.env` has correct frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

---

## 🔴 Dashboard Not Loading

### Error: Dashboard shows "No Courses Yet" despite having enrollments

#### **Solution:**

**Option 1: Check RLS Policies**

1. Go to Supabase Dashboard → **Database** → **Tables** → **enrollments** → **Policies**
2. Verify these policies exist:
   - "Users can view their own enrollments"
   - "Users can create their own enrollments"

**Option 2: Manually Create Test Enrollment**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:

```sql
-- First, get your user ID
SELECT id, email FROM auth.users;

-- Then, get a course ID
SELECT id, title FROM courses LIMIT 5;

-- Create enrollment (replace the UUIDs with actual values)
INSERT INTO enrollments (user_id, course_id, status)
VALUES (
  'your-user-id-here',
  'a-course-id-here',
  'active'
);
```

**Option 3: Check Progress Data**

```sql
-- Check if progress records exist
SELECT * FROM progress WHERE user_id = 'your-user-id';

-- Check enrollments
SELECT * FROM enrollments WHERE user_id = 'your-user-id';
```

---

## 🔴 Permission Errors

### Error: "new row violates row-level security policy"

This means RLS policies are blocking your operation.

#### **Solution:**

**1. Verify Authentication:**
- Check if user is logged in
- Check browser localStorage for `supabase.auth.token`

**2. Check User Role:**
```sql
SELECT id, email, role FROM users WHERE id = auth.uid();
```

**3. Review RLS Policies:**
- Go to Supabase Dashboard → **Database** → **Tables** → Select table → **Policies**
- Verify appropriate policies exist for your operation

**4. Test with Admin Account:**
- Admin accounts bypass most RLS restrictions
- Login as admin@doright.ng to test

---

## 🔴 Migration Errors

### Error: "relation already exists" or "type already exists"

This happens when migrations are run multiple times.

#### **Solution:**

**Option 1: Check What Exists**

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check types
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

**Option 2: Skip Duplicate Creations**

The migrations use `IF NOT EXISTS` and `IF EXISTS` clauses, so this error shouldn't happen. If it does, you can safely ignore it if the table/type already exists.

**Option 3: Fresh Start (⚠️ DELETES ALL DATA)**

```sql
-- WARNING: This will delete ALL your data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run all migrations from Step 1.

---

## 📊 Diagnostic Commands

### Check Database Status

```bash
# From backend directory
cd backend

# Check tables
npm run migrate

# Check logs
cat logs/migrations.log
cat logs/error.log
```

### Check Supabase Connection

```bash
# Test connection
curl http://localhost:4000/health
```

### Check Environment Variables

```bash
# Backend
cd backend
cat .env | grep SUPABASE

# Frontend
cd ..
cat .env | grep VITE
```

---

## 🆘 Still Having Issues?

### 1. Check All Logs

**Backend Logs:**
```bash
cd backend
tail -f logs/combined.log
```

**Browser Console:**
- Press F12
- Check Console tab
- Check Network tab

**Supabase Logs:**
- Go to Supabase Dashboard → **Logs**
- Check for errors

### 2. Verify Complete Setup

- [ ] Supabase project created
- [ ] All environment variables set correctly
- [ ] Migrations run successfully (all 3 files)
- [ ] Default users created
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can access health endpoint
- [ ] Can log in with test credentials

### 3. Start Fresh

If all else fails:

```bash
# Stop all servers (Ctrl+C)

# Clear node_modules
rm -rf node_modules backend/node_modules
rm package-lock.json backend/package-lock.json

# Reinstall
npm install
cd backend && npm install && cd ..

# Run setup
cd backend
npm run migrate:manual  # Follow instructions
npm run create-users
npm run dev

# In new terminal, start frontend
npm run dev
```

---

## 📞 Getting Help

1. **Read Documentation:**
   - [README.md](./README.md) - Project overview
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup instructions
   - [QUICK_FIX.md](./QUICK_FIX.md) - Fast fixes for common issues

2. **Check Supabase Status:**
   - https://status.supabase.com

3. **Supabase Documentation:**
   - https://supabase.com/docs
   - https://supabase.com/docs/guides/auth
   - https://supabase.com/docs/guides/database/tables

---

**Last Updated:** January 2025