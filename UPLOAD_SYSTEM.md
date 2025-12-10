# Media Upload System

A comprehensive file upload system for the DoRight LMS platform that allows administrators to upload and manage media files.

## 🚀 Features

### Backend Upload System (`/api/upload`)
- **Single File Upload**: `/api/upload` - Upload one file at a time
- **Multiple Files Upload**: `/api/upload/multiple` - Upload up to 10 files simultaneously
- **File Management**: `/api/upload/:filename` - Delete uploaded files

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG
- **Audio**: MP3, WAV, OGG
- **Documents**: PDF, DOC, DOCX

### Security Features
- **File Type Validation**: Only allows whitelisted file types
- **Size Limits**: Maximum 100MB per file
- **Secure Storage**: Files stored in `/uploads/` directory
- **Unique Filenames**: Prevents filename conflicts
- **CORS Protection**: Configured for the application domains

## 🔧 Backend Implementation

### Dependencies
```bash
npm install multer
```

### Route Structure
```javascript
// Upload endpoints
POST /api/upload - Single file upload
POST /api/upload/multiple - Multiple files upload
DELETE /api/upload/:filename - Delete file

// File serving
GET /uploads/:filename - Access uploaded files
```

### File Validation
```javascript
const allowedTypes = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'application/msword'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
};
```

## 🎨 Frontend Implementation

### MediaUpload Component
Location: `src/components/admin/MediaUpload.jsx`

**Features:**
- **Drag & Drop**: Drop files directly into the upload area
- **File Preview**: Visual preview of selected files
- **Progress Tracking**: Upload progress with animated spinner
- **Multi-file Support**: Select and upload multiple files
- **File Validation**: Client-side validation with error handling
- **File Management**: Remove files before upload

### MediaManagement Page
Location: `src/pages/admin/MediaManagement.jsx`

**Features:**
- **Upload Interface**: Integrated MediaUpload component
- **File Library**: Grid view of uploaded files
- **Filter System**: Filter by file type (all, image, video, audio, documents)
- **File Actions**: Copy URL, open in new tab, delete files
- **File Details**: File size, upload date, file type

## 📁 Directory Structure

```
backend/
├── uploads/          # Uploaded files storage
├── logs/            # Upload logs
└── routes/
    └── upload.js    # Upload API routes
```

```
src/
├── components/admin/
│   └── MediaUpload.jsx     # Upload component
└── pages/admin/
    └── MediaManagement.jsx # Media management page
```

## 🔗 API Integration

### Single File Upload
```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

### Multiple Files Upload
```javascript
const formData = new FormData();
files.forEach(file => {
  formData.append('files', file);
});

const response = await fetch('/api/upload/multiple', {
  method: 'POST',
  body: formData
});
```

## 🎯 Usage in Blog & Gallery

### Blog Management Integration
```javascript
// Use uploaded images in blog posts
const blogData = {
  title: "Blog Title",
  content: "Blog content with images",
  featured_image_url: uploadedFile.url, // From upload system
  status: "published"
};
```

### Gallery Management Integration
```javascript
// Add uploaded media to gallery
const galleryData = {
  title: "Gallery Item",
  media_url: uploadedFile.url, // From upload system
  category: "Events",
  is_featured: true
};
```

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install multer
   ```

2. **Create Directories**
   ```bash
   mkdir -p uploads logs
   ```

3. **Restart Backend Server**
   ```bash
   npm run dev
   ```

4. **Access Media Management**
   - Login as admin
   - Navigate to: `/admin/media`
   - Or use sidebar menu: "Media"

## 🔒 Security Considerations

### File Validation
- Server-side MIME type validation
- File extension checking
- File size limits (100MB max)
- Unique filename generation

### Storage Security
- Files stored outside public directory initially
- Serves via Express static middleware
- Proper CORS configuration
- Input sanitization

### Access Control
- Authentication required for uploads
- Admin-only access to media management
- Token-based API authentication

## 📊 File Structure Response

### Upload Success Response
```json
{
  "success": true,
  "file": {
    "id": "file_1734025200000_abc123def",
    "originalName": "image.jpg",
    "filename": "image-1734025200000-123456789.jpg",
    "url": "http://localhost:4000/uploads/image-1734025200000-123456789.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "category": "image",
    "uploadedAt": "2025-11-12T07:13:17.441Z"
  }
}
```

## 🚀 Future Enhancements

- **Cloud Storage Integration**: AWS S3, Google Cloud Storage
- **Image Processing**: Thumbnails, compression, format conversion
- **Video Processing**: Transcoding, streaming
- **CDN Integration**: Faster global file delivery
- **Metadata Extraction**: Automatic file metadata reading
- **Virus Scanning**: File security scanning
- **Advanced Analytics**: Upload tracking and reporting

## 🎉 Benefits

1. **Centralized Media Management**: All files in one place
2. **Easy Integration**: Use in blog posts and gallery
3. **User-Friendly Interface**: Drag-and-drop upload
4. **Security**: Proper file validation and storage
5. **Scalable**: Supports multiple file types and sizes
6. **Admin Control**: Full administrative control over media