# DoRight Foundation LMS

A comprehensive Learning Management System built with React, Supabase, and Node.js.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works!)
- Git

### Setup in 3 Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd doright-lms
   npm install
   cd backend && npm install && cd ..
   ```

2. **Configure Environment**
   
   Create `backend/.env`:
   ```env
   SUPABASE_URL=https://jqekzavaerbxjzyeihvv.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   Create `.env` (frontend):
   ```env
   VITE_SUPABASE_URL=https://jqekzavaerbxjzyeihvv.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Setup Database**
   
   See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for complete instructions!
   
   Quick version:
   - Go to Supabase SQL Editor
   - Run `backend/migrations/supabase/001_initial_schema.sql`
   - Run `backend/migrations/supabase/002_rls_policies.sql`
   - Run `backend/migrations/supabase/003_seed_default_users.sql`
   - Create users: `cd backend && npm run create-users`

4. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Login**
   - Open: http://localhost:5173
   - Email: `student@doright.ng`
   - Password: `Student@123`

---

## 📚 Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide (⭐ Start here!)
- **[QUICK_FIX.md](./QUICK_FIX.md)** - Fast fixes for common issues
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Detailed troubleshooting
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step setup guide

---

## 🔑 Default Login Credentials

After running `npm run create-users`:

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@doright.ng | Student@123 |
| **Instructor** | instructor@doright.ng | Instructor@123 |
| **Admin** | admin@doright.ng | Admin@123 |

⚠️ **Change these in production!**

---

## ✨ Features

### For Students
- 📚 Browse and enroll in courses
- 📹 Watch video lessons
- 📝 Take quizzes and assignments
- 📊 Track learning progress
- 🏆 Earn certificates
- 💬 Participate in discussions
- ⭐ Rate and review courses

### For Instructors
- 🎓 Create and manage courses
- 📂 Organize content in modules
- 📹 Upload video lessons
- 📝 Create quizzes and assignments
- ✅ Grade student submissions
- 📢 Post announcements
- 📊 View course analytics

### For Admins
- 👥 Manage users and roles
- 📚 Oversee all courses
- 💰 Track payments
- 📊 View platform analytics
- ⚙️ Configure site settings
- 🖼️ Manage media library

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **React Icons** - Icons

### Backend
- **Node.js & Express** - API server
- **Supabase** - Database & Auth
- **PostgreSQL** - Database (via Supabase)
- **Winston** - Logging
- **Helmet** - Security

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security** - Data protection
- **23 Tables** - Comprehensive schema
- **50+ RLS Policies** - Fine-grained access control

---

## 📁 Project Structure

```
doright-lms/
├── backend/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── migrations/      # Database migrations
│   │   └── supabase/    # ⭐ Run these first!
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── server.js        # Express server
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── context/        # React context
│   ├── services/       # API services
│   └── lib/            # Utilities
├── DATABASE_SETUP.md   # ⭐ Database setup guide
├── QUICK_FIX.md        # Quick fixes
├── TROUBLESHOOTING.md  # Troubleshooting
└── README.md           # This file
```

---

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and roles
- **courses** - Course information
- **modules** - Course sections
- **lessons** - Learning content
- **enrollments** - Student registrations
- **progress** - Learning progress

### Assessment Tables
- **quizzes** - Quiz definitions
- **questions** - Quiz questions
- **quiz_submissions** - Quiz attempts
- **assignments** - Assignment definitions
- **assignment_submissions** - Student work

### Additional Tables
- **certificates** - Completion certificates
- **payments** - Payment transactions
- **discussions** - Course forums
- **reviews** - Course ratings
- **announcements** - Course updates
- **media** - File uploads

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Enrollments
- `GET /api/enrollments` - My enrollments
- `POST /api/enrollments` - Enroll in course
- `DELETE /api/enrollments/:id` - Unenroll

### Progress
- `GET /api/progress/:courseId` - Course progress
- `PUT /api/progress/:lessonId` - Update lesson progress

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/analytics` - Platform analytics

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'dist' folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy backend folder
```

### Database (Supabase)
- Already hosted!
- Just run migrations via SQL Editor

---

## 🐛 Troubleshooting

### ❌ "Could not find the table 'public.enrollments'"
**Solution:** Run database migrations!
See [DATABASE_SETUP.md](./DATABASE_SETUP.md) or [QUICK_FIX.md](./QUICK_FIX.md)

### ❌ "Invalid login credentials"
**Solution:** Create default users!
```bash
cd backend
npm run create-users
```

### ❌ Backend won't start
**Solution:** Check environment variables!
```bash
cat backend/.env
```
Ensure all required variables are set.

### ❌ Frontend shows errors
**Solution:** Check Supabase configuration!
Verify `src/lib/supabase.js` has correct URL and keys.

**For more help:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📊 Available Scripts

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
npm run dev          # Start backend server
npm run migrate      # Check database tables
npm run migrate:manual  # Output SQL for manual migration
npm run create-users # Create default users
npm run setup        # Run migrations + create users
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Getting Help

1. **Read the docs:**
   - [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup
   - [QUICK_FIX.md](./QUICK_FIX.md) - Quick fixes
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed help

2. **Check Supabase:**
   - Dashboard: https://supabase.com/dashboard
   - Docs: https://supabase.com/docs
   - Status: https://status.supabase.com

3. **Review logs:**
   ```bash
   # Backend logs
   cat backend/logs/combined.log

   # Browser console (F12)
   ```

---

## 🎯 Next Steps

After setup:
1. ✅ Log in with test credentials
2. ✅ Explore the dashboard
3. ✅ Create your first course (as instructor)
4. ✅ Enroll in a course (as student)
5. ✅ Customize the platform
6. ✅ Add real content
7. ✅ Deploy to production

---

**Built with ❤️ by DoRight Foundation**

**Last Updated:** January 2025