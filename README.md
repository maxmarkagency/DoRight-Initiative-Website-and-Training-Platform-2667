# DoRight Awareness Initiative Website

A comprehensive website for the DoRight Awareness Initiative, featuring a complete training system with course progression, certification, and user management.

## Features

### Core Website
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Premium design with smooth animations using Framer Motion
- **Multi-page Navigation**: Home, Programs, Training, Webinars, Blog, Join, Contact
- **Accessibility**: WCAG compliant with proper semantic HTML and focus management

### Training System
- **Progressive Learning Path**: 5 structured courses with prerequisites
- **Video Lessons**: Integrated video player with progress tracking
- **Assessments**: Quizzes and project-based evaluations
- **Certificates**: Downloadable certificates upon course completion
- **Dashboard**: Personal training dashboard with progress overview
- **Local Storage**: Demo progress tracking (production ready for backend integration)

### Pages Overview
- **Home**: Hero section, programs overview, training promotion, statistics
- **Programs**: Detailed program information with impact metrics
- **Training**: Course catalog with enrollment and progress tracking
- **Training Dashboard**: Personal progress, certificates, and course management
- **Course Pages**: Individual course content with video player and lesson tracking
- **Webinars**: Upcoming and recorded sessions
- **Blog**: Article system with categories and search
- **Join**: Volunteer, donation, and partnership opportunities
- **Contact**: Contact forms, department information, and FAQ

## Technology Stack

- **Frontend**: React 18 with JSX
- **Routing**: React Router DOM with HashRouter
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Build Tool**: Vite
- **State Management**: React Context API

## Design System

### Colors
- **Primary**: #005BBB (Nigerian blue)
- **Primary 600**: #004499
- **Accent**: #FFC107 (Golden yellow)
- **Neutral 900**: #0D0E16
- **Neutral 700**: #4B5563
- **Neutral 100**: #F9FAFB
- **Success**: #16A34A
- **Danger**: #DC2626

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **H1**: 48px
- **H2**: 32px
- **H3**: 22px
- **H4**: 18px

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Training System Implementation

### Current Implementation (Demo)
The training system currently uses localStorage for progress tracking and certificate generation. This provides a fully functional demo experience.

### Production Backend Integration

To replace localStorage with a proper backend, implement these API endpoints:

#### Authentication Endpoints
```javascript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/user
```

#### Progress Tracking Endpoints
```javascript
GET /api/progress/:userId
POST /api/progress/:userId/:courseId/lesson/:lessonId/complete
GET /api/progress/:userId/:courseId
```

#### Certificate Endpoints
```javascript
POST /api/certificates/:userId/:courseId/claim
GET /api/certificates/:userId
GET /api/certificates/:certificateId/download
```

#### Course Management Endpoints
```javascript
GET /api/courses
GET /api/courses/:courseId
GET /api/courses/:courseId/lessons
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role ENUM('admin', 'learner') DEFAULT 'learner',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Courses Table
```sql
CREATE TABLE courses (
  id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  prerequisite VARCHAR(10) REFERENCES courses(id),
  image_url VARCHAR(500),
  order_index INTEGER,
  created_at TIMESTAMP
);
```

#### Lessons Table
```sql
CREATE TABLE lessons (
  id VARCHAR(20) PRIMARY KEY,
  course_id VARCHAR(10) REFERENCES courses(id),
  title VARCHAR(255),
  video_url VARCHAR(500),
  duration VARCHAR(20),
  order_index INTEGER,
  content TEXT
);
```

#### Course Progress Table
```sql
CREATE TABLE course_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id VARCHAR(10) REFERENCES courses(id),
  completed_lessons JSONB DEFAULT '[]',
  certified BOOLEAN DEFAULT FALSE,
  certificate_id VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Certificates Table
```sql
CREATE TABLE certificates (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id VARCHAR(10) REFERENCES courses(id),
  issued_at TIMESTAMP,
  pdf_url VARCHAR(500)
);
```

### Certificate Generation

#### Server-Side PDF Generation
Replace the current client-side certificate generation with a proper server-side solution:

```javascript
// Example using PDFKit in Node.js
const PDFDocument = require('pdfkit');

function generateCertificate(userData, courseData, certificateId) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  
  // Add certificate content
  doc.fontSize(24).text('DoRight Awareness Initiative', { align: 'center' });
  doc.fontSize(18).text('Certificate of Completion', { align: 'center' });
  doc.fontSize(14).text(`This certifies that ${userData.name}`, { align: 'center' });
  doc.text(`has successfully completed ${courseData.title}`, { align: 'center' });
  doc.text(`Certificate ID: ${certificateId}`, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
  
  return doc;
}
```

### Security Considerations

1. **Authentication**: Implement JWT-based authentication
2. **Authorization**: Role-based access control for admin functions
3. **Data Validation**: Server-side validation for all inputs
4. **Certificate Verification**: Signed certificates with verification endpoints
5. **Rate Limiting**: Prevent abuse of API endpoints
6. **HTTPS**: Secure all communications

## Content Management

### Adding New Courses
1. Update the `src/data/courses.js` file with new course data
2. Add course images to the appropriate CDN or storage service
3. Update prerequisite chains as needed

### Modifying Design Tokens
Update the Tailwind configuration in `tailwind.config.js` to modify colors, fonts, or spacing.

### Adding New Pages
1. Create new page component in `src/pages/`
2. Add route to `src/App.jsx`
3. Update navigation in `src/components/Header.jsx`

## SEO Optimization

### Current Implementation
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Meta descriptions (can be enhanced with React Helmet)

### Recommended Enhancements
1. **React Helmet**: Add dynamic meta tags per page
2. **Structured Data**: JSON-LD for courses and organization
3. **Sitemap**: Generate XML sitemap
4. **Open Graph**: Social media sharing optimization

## Performance Optimization

### Current Optimizations
- Lazy loading of images
- Code splitting with React Router
- Optimized bundle with Vite
- Efficient re-renders with React Context

### Production Recommendations
1. **Image Optimization**: WebP format, responsive images
2. **CDN**: Serve static assets from CDN
3. **Caching**: Implement proper HTTP caching headers
4. **Compression**: Gzip/Brotli compression
5. **Monitoring**: Performance monitoring and analytics

## Deployment

### Static Hosting (Current)
The site can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Full-Stack Deployment
For the complete system with backend:
- **Backend**: Node.js on AWS/Google Cloud/Azure
- **Database**: PostgreSQL or MongoDB
- **File Storage**: AWS S3 for videos and certificates
- **CDN**: CloudFront or similar for global distribution

## Contributing

1. Follow the existing code style and component patterns
2. Ensure all components are responsive and accessible
3. Add proper TypeScript types if migrating to TypeScript
4. Test thoroughly across different devices and browsers
5. Update documentation for any new features

## License

This project is proprietary to the DoRight Awareness Initiative. All rights reserved.

## Support

For technical support or questions about implementation:
- Email: tech@doright.ng
- Documentation: [Internal Wiki]
- Issues: [Internal Issue Tracker]