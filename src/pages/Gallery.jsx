import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.8 },
  in: { opacity: 1, scale: 1 },
};

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      const formattedImages = (data || []).map(item => ({
        id: item.id,
        src: item.thumbnail_url || item.media_url,
        fullSrc: item.media_url,
        alt: item.title,
        description: item.description,
        category: item.category || 'General',
        mediaType: item.media_type,
        isFeatured: item.is_featured
      }));

      setGalleryImages(formattedImages);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError('Failed to load gallery items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(galleryImages.map(img => img.category).filter(Boolean))];

  const filteredImages = selectedCategory === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchGalleryItems}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-4 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our Gallery
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            A visual journey through our events, programs, and community impact.
          </motion.p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-4">No gallery items found.</p>
            <p className="text-gray-500">Check back later for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative overflow-hidden rounded-lg shadow-2xl group cursor-pointer"
                variants={imageVariants}
                initial="initial"
                animate="in"
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <img src={image.src} alt={image.alt} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end justify-center p-4">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-4">
                    <p className="font-semibold text-sm mb-1">{image.alt}</p>
                    {image.description && (
                      <p className="text-xs text-gray-300">{image.description}</p>
                    )}
                  </div>
                </div>
                {image.isFeatured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Gallery;