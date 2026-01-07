import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import MediaUpload from '../../components/admin/MediaUpload';
import * as FiIcons from 'react-icons/fi';
import apiService from '../../services/api';

const { FiTrash2, FiCopy, FiImage, FiVideo, FiMusic, FiFileText, FiExternalLink } = FiIcons;

const MediaManagement = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, image, video, audio, document
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const getFileCategory = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
    return 'document';
  };

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('media-library')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const filesWithUrls = data
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('media-library')
            .getPublicUrl(file.name);

          return {
            id: file.id,
            name: file.name,
            url: publicUrl,
            category: getFileCategory(file.name),
            size: file.metadata?.size || 0,
            uploadedAt: file.created_at
          };
        });

      setMediaFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading media files:', error);
      alert('Failed to load media files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadedFile) => {
    console.log('✅ Upload successful:', uploadedFile);
    loadMediaFiles();
  };

  const getFileIcon = (category) => {
    switch (category) {
      case 'image': return FiImage;
      case 'video': return FiVideo;
      case 'audio': return FiMusic;
      default: return FiFileText;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    }
  };

  const deleteFile = async (fileName) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { error } = await supabase.storage
        .from('media-library')
        .remove([fileName]);

      if (error) throw error;

      setMediaFiles(prev => prev.filter(f => f.name !== fileName));
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file: ' + error.message);
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    if (filter === 'all') return true;
    return file.category === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Media Management</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Media</h2>
        <MediaUpload 
          onUploadSuccess={handleUploadSuccess}
          allowedTypes="image,video,audio,document"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Files', icon: FiFileText },
            { key: 'image', label: 'Images', icon: FiImage },
            { key: 'video', label: 'Videos', icon: FiVideo },
            { key: 'audio', label: 'Audio', icon: FiMusic },
            { key: 'document', label: 'Documents', icon: FiFileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={Icon} className="mr-2 h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Media Library ({filteredFiles.length} files)
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading media files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiFileText} className="mx-auto h-12 w-12 mb-4" />
            <p>No media files found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.category);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Preview */}
                  <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                    {file.category === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <SafeIcon icon={Icon} className="h-12 w-12 text-gray-400" />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-yellow-600 transition-colors"
                          title="Copy URL"
                        >
                          <SafeIcon icon={FiCopy} className="h-4 w-4" />
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                          title="Open in new tab"
                        >
                          <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => deleteFile(file.name)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.category} • {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MediaManagement;