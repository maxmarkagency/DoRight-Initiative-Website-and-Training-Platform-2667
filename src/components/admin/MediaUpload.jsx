import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiUpload, FiX, FiImage, FiVideo, FiFileText, FiMusic } = FiIcons;

const MediaUpload = ({ onUploadSuccess, allowedTypes = 'image,video,document,audio' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return FiImage;
    if (type.startsWith('video/')) return FiVideo;
    if (type.startsWith('audio/')) return FiMusic;
    return FiFileText;
  };

  const validateFile = (file) => {
    const maxSize = 100 * 1024 * 1024;
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      document: ['application/pdf', 'application/msword'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    };

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    const allAllowed = Object.values(allowedTypes).flat();
    if (!allAllowed.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  };

  const handleFiles = (fileList) => {
    const fileArray = Array.from(fileList);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert('Upload errors:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setPreview(validFiles[0]);
      uploadFiles(validFiles);
    }
  };

  const getFileType = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const uploadFiles = async (fileList) => {
    if (fileList.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(fileList).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('media-library')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('media-library')
          .getPublicUrl(filePath);

        const uploadedFile = {
          id: data.id,
          url: publicUrl,
          path: filePath,
          name: file.name,
          size: file.size,
          type: getFileType(file),
          mimeType: file.type
        };

        setUploadProgress(((index + 1) / fileList.length) * 100);
        return uploadedFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      uploadedFiles.forEach(file => {
        console.log('✅ File uploaded:', file);
        onUploadSuccess?.(file);
      });

      alert(`Successfully uploaded ${uploadedFiles.length} file(s)!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setFiles([]);
      setPreview(null);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (index === 0 && newFiles.length > 0) {
      setPreview(newFiles[0]);
    } else if (newFiles.length === 0) {
      setPreview(null);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />

        <SafeIcon
          icon={FiUpload}
          className="mx-auto h-12 w-12 text-gray-400 mb-4 cursor-pointer"
        />

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-sm text-gray-500">
          Supports: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM), Audio (MP3, WAV), Documents (PDF, DOC)
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Maximum file size: 100MB per file
        </p>

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Files:</h4>
          <div className="space-y-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={Icon} className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <SafeIcon icon={FiX} className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
