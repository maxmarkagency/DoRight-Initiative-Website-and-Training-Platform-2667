# ⚡ QUICK FIX: "Could not find the table 'public.enrollments'"

This error means your database tables haven't been created yet. Here's the fastest way to fix it:

## 🎯 Solution (Choose One)

### ✅ Option 1: Via Supabase Dashboard (EASIEST - 5 minutes)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/jqekzavaerbxjzyeihvv/sql

2. **Run Migration 1 - Create Tables:**
   - Click "+ New query"
   - Copy ALL content from `backend/migrations/supabase/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for "Success" message

3. **Run Migration 2 - Add Security:**
   - Click "+ New query" again
   - Copy ALL content from `backend/migrations/supabase/002_rls_policies.sql`
   - Paste and click **"Run"**

4. **Run Migration 3 - Seed Data:**
   - Click "+ New query" again
   - Copy ALL content from `backend/migrations/supabase/003_seed_default_users.sql`
   - Paste and click **"Run"**

5. **Create Default Users:**
   ```bash
   cd backend
   npm run create-users
   ```

6. **Restart Backend:**
   ```bash
   npm run dev
   ```

7. **Refresh your browser** - The error should be gone! ✅

---

### Option 2: Via Command Line (For Advanced Users)

```bash
# Navigate to backend
cd backend

# Output migration SQL to console
npm run migrate:manual

# Copy each SQL block and paste into Supabase SQL Editor
# Then run create-users
npm run create-users

# Restart server
npm run dev
```

---

## ✅ Verify It Worked

1. **Check tables exist:**
   - Go to Supabase Dashboard → **Database** → **Tables**
   - You should see: `users`, `courses`, `enrollments`, `modules`, `lessons`, `progress`, etc.

2. **Check users exist:**
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - You should see 3 users: admin@doright.ng, instructor@doright.ng, student@doright.ng

3. **Test login:**
   - Open your app: http://localhost:5173
   - Login with:
     - Email: `student@doright.ng`
     - Password: `Student@123`

---

## 🤔 Why Did This Happen?

The backend tried to run migrations automatically, but Supabase doesn't allow executing raw SQL via the JavaScript client for security reasons. Migrations must be run through the Supabase Dashboard SQL Editor.

---

## 🆘 Still Not Working?

1. **Check backend logs:**
   ```bash
   cd backend
   cat logs/migrations.log
   ```

2. **Verify Supabase credentials:**
   - Check `backend/.env` has correct:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **See full troubleshooting guide:**
   - Read `TROUBLESHOOTING.md`

---

## 📚 What Each Migration Does

- **001_initial_schema.sql** - Creates all tables (users, courses, enrollments, etc.)
- **002_rls_policies.sql** - Adds security policies (who can see/edit what)
- **003_seed_default_users.sql** - Prepares for default user creation

---

**Time to fix: ~5 minutes** ⏱️

**Difficulty: Easy** 🟢