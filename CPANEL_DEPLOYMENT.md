# 🚀 cPanel Deployment Guide for DoRight LMS

This guide will help you deploy your DoRight Learning Management System to cPanel shared hosting.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ cPanel hosting account with Node.js support
- ✅ Domain name pointing to your cPanel
- ✅ Database credentials (MySQL/PostgreSQL)
- ✅ FTP/File Manager access

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Local Environment

1. **Run the deployment script** (optional):
   ```bash
   chmod +x deploy.sh
   ./deploy.sh prod
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Update environment variables**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your cPanel details
   ```

### Step 2: Upload Files to cPanel

1. **Connect to cPanel**:
   - Log into your cPanel account
   - Open File Manager or use FTP

2. **Upload your project**:
   - Upload the entire project folder to `public_html/`
   - Alternatively, upload to a subdirectory and configure the domain

### Step 3: Configure Node.js Application

1. **Create Node.js Application**:
   - Go to cPanel → Software → Node.js
   - Click "Create Application"
   - Set the following:
     - **Application root**: `your-domain.com/backend`
     - **Application startup file**: `server.js`
     - **Node.js version**: 18+ (recommended)
     - **Application mode**: Production

2. **Configure Environment Variables**:
   In cPanel Node.js settings, add:
   ```env
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://yourdomain.com
   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   JWT_SECRET=your-production-jwt-secret
   ```

### Step 4: Setup Database

1. **Create Database**:
   - cPanel → Databases → MySQL Databases
   - Create a new database
   - Create a database user with full privileges

2. **Run Migrations**:
   - Access your Node.js application via cPanel
   - Navigate to `File Manager` → your-domain.com/backend
   - Run: `node scripts/migrate.js`

### Step 5: Configure Domain & SSL

1. **Point Domain**:
   - Ensure your domain points to cPanel
   - Configure DNS if needed

2. **Enable SSL**:
   - cPanel → Security → SSL/TLS
   - Enable "Let's Encrypt" or upload your certificate

### Step 6: Setup File Uploads

1. **Create Upload Directory**:
   ```bash
   mkdir -p /home/username/public_html/uploads
   chmod 755 /home/username/public_html/uploads
   ```

2. **Set Permissions**:
   - uploads/: 755 (read/write/execute)
   - logs/: 755 (read/write/execute)

## 🔧 Post-Deployment Configuration

### Frontend Build Output
After building, your frontend will be in the `dist/` directory:
```
public_html/
├── backend/           # Node.js backend
├── dist/              # Frontend build (React)
├── uploads/           # User uploaded files
└── start.js           # cPanel start script
```

### Environment Configuration
Update your `.env` file with production values:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database (Use your cPanel database)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Supabase (Update with your project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key

# Security
JWT_SECRET=your-super-secure-production-secret-key
```

## 🛠️ cPanel-Specific Configurations

### 1. Node.js Application Settings
```
Application root: your-domain.com/backend
Application startup file: server.js
Node.js version: 18.17.0
Application mode: Production
```

### 2. Database Configuration
```sql
-- Create database user
CREATE USER 'your_app_user'@'localhost' IDENTIFIED BY 'secure_password';
CREATE DATABASE your_app_database;
GRANT ALL PRIVILEGES ON your_app_database.* TO 'your_app_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. File Permissions
```bash
# Set proper permissions
chmod 755 backend/
chmod 755 uploads/
chmod 755 logs/
chmod 644 backend/.env
```

## 🚨 Troubleshooting

### Common Issues & Solutions

1. **Node.js Application Won't Start**:
   - Check Node.js version compatibility (use 18+)
   - Verify environment variables are set
   - Check error logs in cPanel

2. **Database Connection Errors**:
   - Verify database credentials
   - Check database host (usually 'localhost')
   - Ensure database exists

3. **File Upload Issues**:
   - Verify upload directory exists and has write permissions
   - Check file size limits in cPanel

4. **Frontend Not Loading**:
   - Ensure frontend is built (`npm run build`)
   - Check that dist files are in correct location
   - Verify .htaccess configuration

5. **CORS Errors**:
   - Update FRONTEND_URL in environment variables
   - Check backend CORS configuration

### Performance Optimization

1. **Enable Gzip Compression**:
   The `.htaccess` file already includes compression settings

2. **Browser Caching**:
   Static assets are cached with proper expires headers

3. **Database Optimization**:
   - Add database indexes for better query performance
   - Use connection pooling for multiple requests

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/HTTPS
- [ ] Set secure JWT secret
- [ ] Configure proper file permissions
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for sensitive data
- [ ] Regular backups of database and uploads

## 📊 Monitoring & Maintenance

### 1. Log Monitoring
- Check Node.js application logs in cPanel
- Monitor error logs in `/backend/logs/`
- Set up log rotation for file uploads

### 2. Performance Monitoring
- Monitor database performance
- Check file upload usage
- Monitor server resource usage

### 3. Regular Updates
- Keep Node.js dependencies updated
- Apply security patches
- Regular database backups

## 🎯 Final Verification

After deployment, test:
- [ ] Website loads at your domain
- [ ] Admin login works (`admin@doright.ng` / `AdminPassword123!`)
- [ ] Blog management functions
- [ ] Gallery management works
- [ ] Media upload system works
- [ ] Database connections are stable

## 📞 Support

If you encounter issues:
1. Check cPanel error logs
2. Verify all environment variables
3. Test locally with production build
4. Contact your hosting provider for Node.js-specific issues

---

**🎉 Congratulations!** Your DoRight LMS is now deployed to cPanel and ready for production use!