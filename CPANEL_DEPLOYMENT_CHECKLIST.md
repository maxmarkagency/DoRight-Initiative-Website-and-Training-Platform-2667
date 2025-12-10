# ✅ DoRight LMS cPanel Deployment Checklist

## 📦 Pre-Deployment Status

- ✅ **Frontend Build**: Complete (dist/ directory ready)
- ✅ **Backend Dependencies**: Ready (backend/ directory)
- ✅ **Environment Config**: Template ready (.env.production)
- ✅ **Startup Script**: Ready (start.js for cPanel)
- ✅ **.htaccess Configuration**: Ready (dist/.htaccess)
- ✅ **Upload Directories**: Ready (uploads/, logs/)

## 🚀 Deployment Steps

### Step 1: Prepare Your cPanel Database
- [ ] Create MySQL database (e.g., `doright_lms_db`)
- [ ] Create database user with full privileges
- [ ] Note down: Database name, username, password, host (usually `localhost`)

### Step 2: Get Your Supabase Credentials
- [ ] Log into your Supabase dashboard
- [ ] Copy your project URL and API keys
- [ ] Update the production environment file

### Step 3: Upload Files to cPanel
1. **Using File Manager or FTP, upload the entire project** to your domain's `public_html` directory:
   ```
   public_html/
   ├── dist/                 # Frontend build (React)
   ├── backend/              # Backend API (Node.js)
   ├── start.js              # cPanel startup script
   ├── .htaccess             # Web server configuration
   └── uploads/              # File upload directory
   ```

### Step 4: Configure Node.js Application in cPanel
1. Go to **cPanel → Software → Node.js**
2. Click **"Create Application"**
3. Configure:
   ```
   Application root: your-domain.com/backend
   Application startup file: server.js
   Node.js version: 18.17.0 or higher
   Application mode: Production
   ```

### Step 5: Update Environment Variables
In cPanel Node.js settings, add these environment variables:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your-super-secure-production-jwt-secret
AUTO_RUN_MIGRATIONS=true
```

### Step 6: Set File Permissions
- Set `backend/` to 755
- Set `uploads/` to 755
- Set `logs/` to 755
- Set `backend/.env` to 644

### Step 7: Start the Application
1. Click **"Start App"** in cPanel Node.js section
2. Monitor the logs for any errors
3. Test the application at your domain

## 🔍 Post-Deployment Testing

### Frontend Tests
- [ ] Website loads at your domain
- [ ] Navigation works (React Router)
- [ ] Static assets load correctly (CSS, JS, images)

### Backend API Tests
- [ ] Health check: `https://yourdomain.com/api/health`
- [ ] Admin login: Test with `admin@doright.ng` / `AdminPassword123!`
- [ ] Blog management functions
- [ ] Gallery management functions
- [ ] File upload system

### Database Tests
- [ ] Database connections are stable
- [ ] Migrations ran successfully (check logs)
- [ ] Default users created

## 🛠️ Troubleshooting

### Common Issues

1. **Application won't start**:
   - Check Node.js version (use 18+)
   - Verify all environment variables are set
   - Check cPanel error logs

2. **Frontend not loading**:
   - Ensure `dist/` directory exists and has files
   - Check .htaccess configuration
   - Verify domain DNS settings

3. **Database errors**:
   - Verify database credentials in environment variables
   - Check that database exists and user has privileges
   - Review migration logs

4. **API errors**:
   - Check backend logs in cPanel
   - Verify Supabase credentials
   - Ensure CORS settings are correct

## 📞 Support Resources

- **cPanel Documentation**: Check your hosting provider's Node.js setup guide
- **Application Logs**: Available in cPanel → Node.js → Logs
- **Error Monitoring**: Check both frontend console and backend logs

## 🔒 Security Checklist

- [ ] SSL certificate installed (Let's Encrypt or custom)
- [ ] Strong JWT_SECRET configured
- [ ] Environment variables properly secured
- [ ] File permissions set correctly
- [ ] Database user has minimal required privileges

---

**🎉 Ready to Deploy!** All files are prepared and ready for cPanel deployment.