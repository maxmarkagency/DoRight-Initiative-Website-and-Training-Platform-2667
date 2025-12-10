import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/uploads.log' })
  ]
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const name = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  };

  const allAllowedTypes = Object.values(allowedTypes).flat();
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

/**
 * POST /api/upload - Upload a single file
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    console.log('📁 File upload called');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const fileData = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: req.file.mimetype.startsWith('image/') ? 'image' : 
                req.file.mimetype.startsWith('video/') ? 'video' :
                req.file.mimetype.startsWith('audio/') ? 'audio' : 'document',
      uploadedAt: new Date().toISOString()
    };

    logger.info('File uploaded successfully', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl
    });

    console.log('✅ File uploaded:', fileData.originalName);
    
    res.status(201).json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.log('❌ File upload error:', error.message);
    logger.error('File upload error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
});

/**
 * POST /api/upload/multiple - Upload multiple files
 */
router.post('/multiple', upload.array('files', 10), async (req, res, next) => {
  try {
    console.log('📁 Multiple files upload called');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: fileUrl,
        size: file.size,
        mimetype: file.mimetype,
        category: file.mimetype.startsWith('image/') ? 'image' : 
                  file.mimetype.startsWith('video/') ? 'video' :
                  file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        uploadedAt: new Date().toISOString()
      };
    });

    logger.info(`${uploadedFiles.length} files uploaded successfully`, {
      files: uploadedFiles.map(f => f.filename),
      totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
    });

    console.log('✅ Multiple files uploaded:', uploadedFiles.length);
    
    res.status(201).json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    console.log('❌ Multiple files upload error:', error.message);
    logger.error('Multiple files upload error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files'
    });
  }
});

/**
 * DELETE /api/upload/:filename - Delete a file
 */
router.delete('/:filename', async (req, res, next) => {
  try {
    console.log('📁 File delete called for:', req.params.filename);
    
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    fs.unlinkSync(filePath);
    
    logger.info('File deleted successfully', { filename });
    console.log('✅ File deleted:', filename);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.log('❌ File delete error:', error.message);
    logger.error('File delete error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

export default router;