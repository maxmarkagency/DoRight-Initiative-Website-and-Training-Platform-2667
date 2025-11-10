# 🚀 Complete Database Setup Guide

This guide will walk you through setting up your DoRight LMS database in **5-10 minutes**.

---

## ⚡ Quick Start (Fastest Method)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv
2. Click **"SQL Editor"** in the left sidebar
3. You should see a SQL editor with a "Run" button

### Step 2: Run Migration 1 - Create All Tables

1. In the SQL Editor, click **"+ New query"**
2. Open the file: `backend/migrations/supabase/001_initial_schema.sql`
3. **Copy the ENTIRE file content** (all ~450 lines)
4. **Paste** into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for **"Success. No rows returned"** message (this may take 5-10 seconds)

**✅ What this creates:**
- All database tables (users, courses, enrollments, modules, lessons, progress, etc.)
- Custom types for roles and statuses
- Indexes for performance
- Automatic timestamp triggers

### Step 3: Run Migration 2 - Add Security Policies

1. Click **"+ New query"** again
2. Open the file: `backend/migrations/supabase/002_rls_policies.sql`
3. **Copy the ENTIRE file content** (all ~200+ lines)
4. **Paste** into the SQL Editor
5. Click **"Run"**
6. Wait for **"Success. No rows returned"** message

**✅ What this creates:**
- Row Level Security (RLS) policies
- Access control rules (who can see/edit what)
- User permissions based on roles
- Data protection

### Step 4: Run Migration 3 - Prepare User Profiles

1. Click **"+ New query"** again
2. Open the file: `backend/migrations/supabase/003_seed_default_users.sql`
3. **Copy the ENTIRE file content**
4. **Paste** into the SQL Editor
5. Click **"Run"**

**✅ What this creates:**
- Helper function for creating user profiles

### Step 5: Verify Tables Were Created

1. In Supabase Dashboard, click **"Database"** → **"Tables"** in the left sidebar
2. You should now see these tables:
   - ✅ users
   - ✅ courses
   - ✅ enrollments
   - ✅ modules
   - ✅ lessons
   - ✅ progress
   - ✅ quizzes
   - ✅ questions
   - ✅ quiz_submissions
   - ✅ assignments
   - ✅ assignment_submissions
   - ✅ certificates
   - ✅ categories
   - ✅ course_categories
   - ✅ media
   - ✅ payments
   - ✅ announcements
   - ✅ discussions
   - ✅ discussion_replies
   - ✅ reviews
   - ✅ settings

**If you see all these tables, congratulations! Your database is set up! 🎉**

### Step 6: Create Default User Accounts

Now create the default users (admin, instructor, student):

```bash
cd backend
npm run create-users
```

**Expected output:**
```
[INFO] Creating default users...
✅ Successfully created admin@doright.ng (Role: admin)
✅ Successfully created instructor@doright.ng (Role: instructor)
✅ Successfully created student@doright.ng (Role: student)
[INFO] Default users created successfully
```

### Step 7: Verify Users Were Created

1. In Supabase Dashboard, click **"Authentication"** → **"Users"**
2. You should see 3 users:
   - ✅ admin@doright.ng
   - ✅ instructor@doright.ng
   - ✅ student@doright.ng

3. Click **"Database"** → **"Table Editor"** → **users** table
4. You should see 3 rows with proper roles

### Step 8: Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
[INFO] Checking database schema...
✓ Table 'users' exists
✓ Table 'courses' exists
✓ Table 'enrollments' exists
✓ Table 'modules' exists
✓ Table 'lessons' exists
✓ Table 'progress' exists
✅ All critical tables exist!
[INFO] Server started on port 4000
```

### Step 9: Test the Application

1. Open your browser: http://localhost:5173
2. Click **"Login"**
3. Test with these credentials:

**Student Account:**
- Email: `student@doright.ng`
- Password: `Student@123`

**Instructor Account:**
- Email: `instructor@doright.ng`
- Password: `Instructor@123`

**Admin Account:**
- Email: `admin@doright.ng`
- Password: `Admin@123`

**✅ If you can log in, everything is working perfectly!**

---

## 🎯 What Each Migration Does

### Migration 001: Initial Schema
- Creates 23 database tables
- Defines 7 custom data types (user_role, course_status, etc.)
- Adds 20+ indexes for performance
- Sets up automatic timestamp updates

**Key tables:**
- `users` - User profiles and roles
- `courses` - Course information
- `modules` - Course sections
- `lessons` - Individual learning content
- `enrollments` - Student course registrations
- `progress` - Learning progress tracking
- `quizzes` & `questions` - Assessments
- `assignments` - Homework and projects
- `certificates` - Completion certificates
- `payments` - Payment transactions
- `discussions` - Course forums
- `reviews` - Course ratings

### Migration 002: RLS Policies
- Enables Row Level Security on all tables
- Creates 50+ security policies
- Ensures users can only access their own data
- Gives instructors access to their courses
- Gives admins full access

**Security rules:**
- Students see only their enrollments and progress
- Instructors manage their own courses
- Admins can see and modify everything
- Public users can browse published courses

### Migration 003: Seed Default Users
- Creates a helper function for user profiles
- Documents default account credentials
- Prepares for user creation script

---

## 🔍 Verification Checklist

Use this checklist to ensure everything is set up correctly:

### Database Tables
- [ ] 23 tables created in Supabase
- [ ] All tables visible in Database → Tables
- [ ] RLS enabled on all tables (check Table Editor → Policies)

### User Accounts
- [ ] 3 users in Authentication → Users
- [ ] 3 profiles in users table with correct roles
- [ ] All users marked as active and email_verified

### Backend Server
- [ ] Server starts without errors
- [ ] Health check works: http://localhost:4000/health
- [ ] Migration check passes (shows all tables exist)

### Frontend Application
- [ ] Can access: http://localhost:5173
- [ ] Login page loads
- [ ] Can log in with student account
- [ ] Dashboard loads after login

---

## ❌ Troubleshooting

### Error: "relation already exists"

**What it means:** You've already run the migration before.

**Solution:** This is safe to ignore! The tables already exist. Skip to Step 5 to verify.

**If you want a fresh start:**
```sql
-- ⚠️ WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Then run all migrations again.

---

### Error: "type already exists"

**What it means:** The custom types (user_role, course_status, etc.) already exist.

**Solution:** This is safe to ignore! Skip to Step 5 to verify.

---

### Error: "Could not find the table 'public.enrollments'"

**What it means:** Migrations haven't been run yet.

**Solution:** Follow Steps 1-4 above to run the migrations.

---

### Error: "Invalid login credentials"

**What it means:** Users haven't been created yet.

**Solution:**

1. **Check if users exist:**
   - Go to Supabase Dashboard → Authentication → Users
   - If empty, run: `npm run create-users`

2. **Verify Service Role Key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy **service_role** key (NOT anon key!)
   - Update `backend/.env`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
     ```

3. **Disable Email Confirmation:**
   - Go to Authentication → Providers → Email
   - Ensure **"Confirm email"** is **OFF**

4. **Recreate users:**
   ```bash
   cd backend
   npm run create-users
   ```

---

### Backend won't start

**Check these:**

1. **Is Supabase URL correct?**
   ```bash
   cat backend/.env | grep SUPABASE_URL
   ```
   Should be: `https://jqekzavaerbxjzyeihvv.supabase.co`

2. **Are all environment variables set?**
   ```bash
   cat backend/.env
   ```
   Required:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - PORT (optional, defaults to 4000)

3. **Are dependencies installed?**
   ```bash
   cd backend
   npm install
   ```

---

### Can't access frontend

**Check these:**

1. **Is frontend running?**
   ```bash
   npm run dev
   ```
   Should show: "Local: http://localhost:5173"

2. **Is Supabase configured in frontend?**
   Check `src/lib/supabase.js` has correct:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

---

## 📋 Default Login Credentials

After running `npm run create-users`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@doright.ng | Admin@123 |
| **Instructor** | instructor@doright.ng | Instructor@123 |
| **Student** | student@doright.ng | Student@123 |

**⚠️ Important:** Change these passwords in production!

---

## 🔒 Security Notes

### In Development:
- Email confirmation is disabled for easier testing
- Default passwords are simple for convenience
- Service role key is used to create users programmatically

### In Production:
- ✅ Enable email confirmation
- ✅ Change all default passwords
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Keep service role key secret (never commit to Git!)
- ✅ Enable 2FA for admin accounts
- ✅ Review and tighten RLS policies
- ✅ Enable rate limiting on authentication endpoints

---

## 🆘 Still Having Issues?

### Check Backend Logs
```bash
cd backend
cat logs/combined.log | tail -n 50
```

### Check Migration History
```sql
-- In Supabase SQL Editor
SELECT * FROM migrations_history ORDER BY executed_at DESC;
```

### Test Database Connection
```bash
cd backend
node -e "const { supabaseAdmin } = require('./config/supabase.js'); supabaseAdmin.from('users').select('count').then(d => console.log('✅ Connected!', d)).catch(e => console.log('❌ Error:', e.message));"
```

### Get Help
- Read: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Read: [QUICK_FIX.md](./QUICK_FIX.md)
- Read: [README.md](./README.md)
- Check Supabase Status: https://status.supabase.com

---

## 🎉 Success!

If you've completed all steps and can log in, congratulations! Your DoRight LMS is now fully set up and ready to use.

**Next steps:**
- Explore the admin dashboard
- Create your first course
- Customize the platform
- Add real content

**Time to complete:** ~5-10 minutes ⏱️

**Difficulty:** Easy 🟢

---

**Last Updated:** January 2025