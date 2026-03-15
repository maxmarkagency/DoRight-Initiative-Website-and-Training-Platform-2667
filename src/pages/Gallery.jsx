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
  const [selectedCategory, setSelectedCategory] = useState('Images');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false }); // Sort by newest first

      if (error) throw error;


      // Group items
      const groupedItems = {};
      const standaloneItems = [];

      const cleanTitle = (title) => {
        if (!title.includes(' - ')) return title;
        const parts = title.split(' - ');
        const lastPart = parts[parts.length - 1].toLowerCase();
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'];
        if (extensions.some(ext => lastPart.endsWith(ext))) {
          return parts.slice(0, -1).join(' - ');
        }
        return title;
      };

      (data || []).forEach(item => {
        const formattedItem = {
          id: item.id,
          src: item.thumbnail_url || item.media_url,
          fullSrc: item.media_url,
          alt: cleanTitle(item.title),
          description: item.description,
          category: item.category || 'Images',
          mediaType: item.media_type,
          isFeatured: item.is_featured,
          groupId: item.group_id
        };

        if (item.group_id) {
          if (!groupedItems[item.group_id]) {
            groupedItems[item.group_id] = [];
          }
          groupedItems[item.group_id].push(formattedItem);
        } else {
          standaloneItems.push(formattedItem);
        }
      });

      const processedGroupIds = new Set();
      const finalDisplayList = [];

      (data || []).forEach(item => {
        if (item.group_id) {
          if (processedGroupIds.has(item.group_id)) return; // Already added this group

          processedGroupIds.add(item.group_id);
          const group = groupedItems[item.group_id];
          finalDisplayList.push({
            ...group[0],
            isGroup: true,
            groupItems: group,
            itemCount: group.length,
            alt: cleanTitle(group[0].alt) // ensure it's clean (it should already be from formattedItem)
          });
        } else {
          finalDisplayList.push({
            id: item.id,
            src: item.thumbnail_url || item.media_url,
            fullSrc: item.media_url,
            alt: cleanTitle(item.title),
            description: item.description,
            category: item.category || 'Images',
            mediaType: item.media_type,
            isFeatured: item.is_featured,
            groupId: null
          });
        }
      });

      setGalleryImages(finalDisplayList);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError('Failed to load gallery items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item) => {
    if (item.isGroup) {
      setCurrentGroup(item.groupItems);
    } else {
      setCurrentGroup([item]);
    }
    setCurrentImageIndex(0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentGroup([]);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % currentGroup.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + currentGroup.length) % currentGroup.length);
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const categories = ['Images', 'Videos'];

  const filteredImages = selectedCategory === 'Videos'
    ? galleryImages.filter(img => img.mediaType === 'video')
    : galleryImages.filter(img => img.mediaType !== 'video');

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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
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
                onClick={() => openLightbox(image)}
              >
                <img src={image.src} alt={image.alt} className="w-full h-64 object-cover" />

                {/* Video Overlay */}
                {image.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-yellow-400 bg-opacity-80 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.5 3.5v13l11-6.5-11-6.5z"></path>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Group Indicator */}
                {image.isGroup && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    +{image.itemCount}
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end justify-center p-4">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-4">
                    <p className="font-semibold text-sm mb-1">{image.alt}</p>
                    {image.description && (
                      <p className="text-xs text-gray-300">{image.description}</p>
                    )}
                    {image.isGroup && (
                      <p className="text-xs text-yellow-400 mt-2 font-semibold">Click to view all {image.itemCount} photos</p>
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

      {/* Lightbox Modal */}
      {lightboxOpen && currentGroup.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4" onClick={closeLightbox}>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-[110] p-2"
            onClick={closeLightbox}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {currentGroup[currentImageIndex].mediaType === 'video' ? (
              getYouTubeId(currentGroup[currentImageIndex].fullSrc) ? (
                <div className="w-full aspect-video max-w-4xl mx-auto shadow-2xl rounded-lg overflow-hidden flex items-center justify-center bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(currentGroup[currentImageIndex].fullSrc)}?autoplay=1`}
                    title={currentGroup[currentImageIndex].alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <video
                  src={currentGroup[currentImageIndex].fullSrc}
                  controls
                  className="max-w-full max-h-[80vh] object-contain"
                  autoPlay
                />
              )
            ) : (
              <img
                src={currentGroup[currentImageIndex].fullSrc}
                alt={currentGroup[currentImageIndex].alt}
                className="max-w-full max-h-[80vh] object-contain"
              />
            )}

            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{currentGroup[currentImageIndex].alt}</h3>
              {currentGroup[currentImageIndex].description && (
                <p className="text-gray-400 mt-1">{currentGroup[currentImageIndex].description}</p>
              )}
              {currentGroup.length > 1 && (
                <p className="text-gray-500 text-sm mt-2">{currentImageIndex + 1} / {currentGroup.length}</p>
              )}
            </div>

            {/* Navigation Buttons */}
            {currentGroup.length > 1 && (
              <>
                <button
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 md:-ml-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                  onClick={prevImage}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 md:-mr-12 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full"
                  onClick={nextImage}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnails Strip */}
            {currentGroup.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full pb-2">
                {currentGroup.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden transition-colors ${currentImageIndex === idx ? 'border-yellow-400' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={item.src} alt={item.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Gallery;