import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiMapPin, FiUsers } = FiIcons;

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = ['All', 'Training', 'Community Events', 'Workshops', 'Advocacy', 'Youth Programs'];

  const galleryItems = [
    {
      id: 1,
      title: 'Youth Leadership Workshop - Lagos',
      category: 'Training',
      date: '2024-01-15',
      location: 'Lagos, Nigeria',
      participants: 45,
      description: 'Young leaders participating in our flagship leadership development workshop, learning about integrity and civic responsibility.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'Community Integrity Campaign',
      category: 'Community Events',
      date: '2024-01-10',
      location: 'Abuja, Nigeria',
      participants: 200,
      description: 'Citizens gathering for our community integrity campaign, promoting transparency and accountability at the local level.',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 3,
      title: 'Digital Training Session',
      category: 'Training',
      date: '2023-12-20',
      location: 'Online Platform',
      participants: 150,
      description: 'Participants engaging in our online training platform, learning about anti-corruption strategies and reporting mechanisms.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 4,
      title: 'Policy Advocacy Workshop',
      category: 'Workshops',
      date: '2023-12-15',
      location: 'Port Harcourt, Nigeria',
      participants: 80,
      description: 'Stakeholders and community leaders learning about effective policy advocacy and grassroots mobilization strategies.',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 5,
      title: 'Women in Leadership Summit',
      category: 'Advocacy',
      date: '2023-12-01',
      location: 'Kano, Nigeria',
      participants: 120,
      description: 'Women leaders from across northern Nigeria discussing governance, integrity, and community development.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 6,
      title: 'Anti-Corruption Awareness Drive',
      category: 'Community Events',
      date: '2023-11-25',
      location: 'Ibadan, Nigeria',
      participants: 300,
      description: 'Large community gathering focused on raising awareness about corruption and promoting citizen reporting mechanisms.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 7,
      title: 'Student Leadership Program',
      category: 'Youth Programs',
      date: '2023-11-20',
      location: 'Enugu, Nigeria',
      participants: 60,
      description: 'University students participating in our leadership development program, focusing on ethical leadership and civic engagement.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 8,
      title: 'Community Dialogue Session',
      category: 'Community Events',
      date: '2023-11-15',
      location: 'Kaduna, Nigeria',
      participants: 85,
      description: 'Community members engaging in dialogue about local governance challenges and collaborative solutions.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 9,
      title: 'Transparency Technology Workshop',
      category: 'Workshops',
      date: '2023-11-10',
      location: 'Lagos, Nigeria',
      participants: 40,
      description: 'Tech enthusiasts and civic activists learning about digital tools for promoting government transparency.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 10,
      title: 'Youth Civic Engagement Rally',
      category: 'Youth Programs',
      date: '2023-11-05',
      location: 'Benin City, Nigeria',
      participants: 180,
      description: 'Young Nigerians rallying for increased civic participation and democratic engagement in their communities.',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 11,
      title: 'Integrity Champions Award Ceremony',
      category: 'Community Events',
      date: '2023-10-30',
      location: 'Abuja, Nigeria',
      participants: 250,
      description: 'Celebrating individuals and organizations that have demonstrated exceptional commitment to integrity and accountability.',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 12,
      title: 'Grassroots Mobilization Training',
      category: 'Training',
      date: '2023-10-25',
      location: 'Jos, Nigeria',
      participants: 70,
      description: 'Community organizers learning effective strategies for grassroots mobilization and community engagement.',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const filteredItems = galleryItems.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const featuredItem = galleryItems.find(item => item.featured);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openModal = (item) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredItems.length;
    } else {
      newIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    }
    
    setSelectedImage(filteredItems[newIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight">
              Gallery
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Explore moments from our journey promoting integrity, accountability, 
              and civic responsibility across Nigeria through community events, 
              training programs, and advocacy initiatives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="max-w-container mx-auto px-5">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {featuredItem && selectedCategory === 'All' && (
        <section className="py-16 bg-white">
          <div className="max-w-container mx-auto px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-neutral-50 to-blue-50 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => openModal(featuredItem)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <span className="bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                    <span className="ml-3 text-sm text-neutral-600">
                      {featuredItem.category}
                    </span>
                  </div>
                  <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">
                    {featuredItem.title}
                  </h2>
                  <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                    {featuredItem.description}
                  </p>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      {formatDate(featuredItem.date)}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                      {featuredItem.location}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
                      {featuredItem.participants} participants
                    </div>
                  </div>
                </div>
                <div className="relative h-96 lg:h-auto">
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">
              {selectedCategory === 'All' ? 'All Events' : selectedCategory}
            </h2>
            <p className="text-lg text-neutral-700">
              {filteredItems.length} {filteredItems.length === 1 ? 'event' : 'events'} found
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems
              .filter(item => !item.featured || selectedCategory !== 'All')
              .map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => openModal(item)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-neutral-700 mb-4 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      {formatDate(item.date)}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                      {item.location}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
                      {item.participants} participants
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-neutral-600 mb-4">No events found in this category</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-primary hover:text-primary-600 font-medium"
              >
                View all events
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <SafeIcon icon={FiChevronLeft} className="w-6 h-6" />
              </button>

              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <SafeIcon icon={FiChevronRight} className="w-6 h-6" />
              </button>

              {/* Image and Details */}
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-96 md:h-[500px] object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedImage.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-4">
                    {selectedImage.title}
                  </h3>
                  <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                    {selectedImage.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      {formatDate(selectedImage.date)}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 mr-2" />
                      {selectedImage.location}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
                      {selectedImage.participants} participants
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Gallery;