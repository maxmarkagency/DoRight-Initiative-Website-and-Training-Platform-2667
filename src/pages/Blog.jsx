import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { supabase } from '../lib/supabase';

const { FiCalendar, FiUser, FiArrowRight, FiSearch, FiTag, FiCheck } = FiIcons;

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, users(full_name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = (data || []).map(post => ({
        ...post,
        author: post.users?.full_name || 'DoRight Team',
        image: post.featured_image_url,
        featured: post.is_featured,
        date: post.published_at || post.created_at,
        category: post.tags?.[0] || 'General',
        readTime: calculateReadTime(post.content)
      }));

      setBlogPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const categories = ['All', 'Integrity', 'Leadership', 'Governance', 'Community Action', 'Policy'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured || selectedCategory !== 'All' || searchTerm);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> Insights & Stories </h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              News, stories, and analysis on ethics, governance, and civic action from the DoRight community and our partners across Nigeria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="max-w-container mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredPost && selectedCategory === 'All' && !searchTerm && (
        <section className="py-16 bg-white">
          <div className="max-w-container mx-auto px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-2xl overflow-hidden shadow-lg"
            >
              <Link to={`/blog/${featuredPost.id}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                      <span className="bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                      <span className="ml-3 text-sm text-neutral-600 flex items-center">
                        <SafeIcon icon={FiTag} className="w-4 h-4 mr-1" />
                        {featuredPost.category}
                      </span>
                    </div>
                    <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-neutral-600">
                        <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
                        <span className="mr-4">{featuredPost.author}</span>
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                        <span>{formatDate(featuredPost.date)}</span>
                      </div>
                      <span className="text-sm text-neutral-500">{featuredPost.readTime}</span>
                    </div>
                    <div className="self-start bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center">
                      Read Article
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative">
                    <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-neutral-600">Loading articles...</p>
            </div>
          ) : regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <Link to={`/blog/${post.id}`} key={post.id}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col"
                  >
                    <div className="relative">
                      <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-neutral-700 mb-4 leading-relaxed line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                        <div className="flex items-center">
                          <SafeIcon icon={FiUser} className="w-4 h-4 mr-1" />
                          <span>{post.author}</span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center text-sm text-neutral-500">
                          <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                          {formatDate(post.date)}
                        </div>
                        <div className="text-primary hover:text-primary-600 font-medium text-sm inline-flex items-center">
                          Read More
                          <SafeIcon icon={FiArrowRight} className="ml-1 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <SafeIcon icon={FiSearch} className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No articles found</h3>
              <p className="text-neutral-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h2 font-heading font-bold mb-6"> Stay Informed </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest insights, stories, and updates from the DoRight community.
            </p>
            <div className="max-w-md mx-auto">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <div className="bg-green-500/20 text-white p-4 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 mr-3" />
                  <span>Thank you for subscribing!</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Blog;