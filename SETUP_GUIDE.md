# DoRight LMS - Complete Setup Guide

This guide will walk you through setting up the DoRight Learning Management System from scratch.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed ([Download](https://nodejs.org/))
- A **Supabase account** ([Sign up free](https://supabase.com))
- A code editor (VS Code recommended)
- Basic knowledge of terminal/command line

---

## 🎯 Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** DoRight LMS
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your location
4. Click **"Create new project"**
5. Wait ~2 minutes for initialization

---

## 🔑 Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**

2. You'll need three values:

   **a) Project URL**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **b) anon public key** (under "Project API keys" → "anon public")
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **c) service_role secret key** (under "Project API keys" → "service_role")
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **IMPORTANT:** Never commit the `service_role` key to GitHub! It has admin access to your database.

---

## 💻 Step 3: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd doright-lms

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## ⚙️ Step 4: Configure Environment Variables

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `backend/.env` with your credentials:

   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-public-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173

   # Migration Settings
   RUN_MIGRATIONS_ON_START=true
   CREATE_USERS_ON_START=true
   ```

   **Replace:**
   - `your-project-id` with your actual Supabase project ID
   - `your-anon-public-key-here` with your anon key
   - `your-service-role-secret-key-here` with your service role key

### Frontend Configuration

1. Navigate back to the root directory:
   ```bash
   cd ..
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

## 🗄️ Step 5: Initialize Database

The backend server will automatically run migrations and create default users on first start. However, you can also run them manually:

### Option A: Automatic (Recommended)

Just start the backend server (Step 6), and it will handle everything automatically.

### Option B: Manual

```bash
cd backend

# Run database migrations
npm run migrate

# Create default users
npm run create-users
```

You should see output like:
```
✅ Migration 001_initial_schema.sql executed successfully
✅ Migration 002_rls_policies.sql executed successfully
✅ Migration 003_seed_default_users.sql executed successfully
✅ Successfully created admin@doright.ng
✅ Successfully created instructor@doright.ng
✅ Successfully created student@doright.ng
```

---

## 🚀 Step 6: Start the Application

### Option A: Start Both Servers Together

From the root directory:

```bash
npm run dev
```

This will start:
- **Frontend** on `http://localhost:5173`
- **Backend** on `http://localhost:5000`

### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## ✅ Step 7: Verify Installation

1. **Open your browser** and go to `http://localhost:5173`

2. **Test Login** with one of the default accounts:

   **Admin Account:**
   - Email: `admin@doright.ng`
   - Password: `Admin@123`

   **Instructor Account:**
   - Email: `instructor@doright.ng`
   - Password: `Instructor@123`

   **Student Account:**
   - Email: `student@doright.ng`
   - Password: `Student@123`

3. **Verify Database Tables:**
   - Go to Supabase Dashboard → **Database** → **Tables**
   - You should see tables like: `users`, `courses`, `enrollments`, `progress`, etc.

4. **Check Backend Health:**
   - Visit `http://localhost:5000/health` in your browser
   - You should see: `{"status": "OK"}`

---

## 🎓 Step 8: Explore the Application

### As a Student:
1. Log in with `student@doright.ng`
2. Browse courses on the **Training** page
3. Enroll in a course
4. Access your dashboard to track progress

### As an Instructor:
1. Log in with `instructor@doright.ng`
2. Create a new course
3. Add modules and lessons
4. View student enrollments

### As an Admin:
1. Log in with `admin@doright.ng`
2. Access the **Admin Dashboard**
3. Manage users, courses, and content
4. View analytics and system settings

---

## 🐛 Troubleshooting

### Issue: "Could not find the table 'public.enrollments'"

**Solution:**
```bash
cd backend
npm run migrate
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#error-could-not-find-the-table-publicenrollments-in-the-schema-cache) for details.

### Issue: "Invalid login credentials"

**Solution:**
```bash
cd backend
npm run create-users
```

Also verify in Supabase Dashboard → **Authentication** → **Email Auth**:
- "Enable email confirmations" should be **OFF** (unless you've configured email)

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#error-invalid-login-credentials) for details.

### Issue: Frontend can't connect to backend

**Solution:**
1. Check that backend is running on `http://localhost:5000`
2. Verify `FRONTEND_URL` in `backend/.env` is `http://localhost:5173`
3. Check CORS settings

### Issue: Permission errors (RLS)

**Solution:**
1. Verify migrations ran successfully
2. Check that RLS policies exist in Supabase Dashboard → **Database** → **Policies**
3. Ensure you're logged in with a valid account

---

## 📚 Next Steps

- Read the [README.md](./README.md) for project overview
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Explore the [Supabase Documentation](https://supabase.com/docs)
- Customize the application for your needs

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Enable email verification in Supabase
- [ ] Set up proper CORS policies
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Review and test all RLS policies
- [ ] Use environment-specific configurations
- [ ] Enable HTTPS
- [ ] Set up database backups

---

## 📞 Need Help?

If you encounter any issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review Supabase logs (Dashboard → **Logs**)
3. Check browser console (F12) for frontend errors
4. Check terminal for backend errors
5. Open an issue on GitHub

---

**Good luck with your DoRight LMS setup! 🎉**