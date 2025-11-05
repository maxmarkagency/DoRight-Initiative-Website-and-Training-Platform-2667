import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { blogPosts } from '../data/blog';

const { FiCalendar, FiUser, FiClock, FiTag, FiArrowLeft, FiFacebook, FiTwitter, FiLinkedin } = FiIcons;

const BlogPost = () => {
  const { postId } = useParams();
  const post = blogPosts.find(p => p.id === parseInt(postId));

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Post Header */}
      <section className="relative h-96">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-4xl mx-auto px-5"
          >
            <div className="mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-tight">
              {post.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Post Content */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-neutral-200">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-600">
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center">
              <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Social Share */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm font-medium text-neutral-700">Share:</span>
            <a href="#" className="text-neutral-500 hover:text-primary transition-colors">
              <SafeIcon icon={FiFacebook} className="w-5 h-5" />
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-colors">
              <SafeIcon icon={FiTwitter} className="w-5 h-5" />
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary transition-colors">
              <SafeIcon icon={FiLinkedin} className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Article Body */}
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary hover:text-primary-600 font-medium transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
            Back to All Articles
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-neutral-100">
          <div className="max-w-container mx-auto px-5">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-12 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link to={`/blog/${relatedPost.id}`} key={relatedPost.id}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full"
                  >
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <span className="text-sm text-primary font-medium">{relatedPost.category}</span>
                      <h3 className="text-h4 font-heading font-bold text-neutral-900 mt-2 mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-neutral-700 leading-relaxed line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default BlogPost;