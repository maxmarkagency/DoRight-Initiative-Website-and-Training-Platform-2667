import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import BlogSidebar from '../components/BlogSidebar';

const { FiCalendar, FiUser, FiClock, FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiMessageCircle } = FiIcons;

const BlogPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBlogPost();
  }, [postId]);

  const fetchBlogPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('status', 'published')
        .maybeSingle();

      if (postError) throw postError;

      if (!postData) {
        setNotFound(true);
        return;
      }

      const formattedPost = {
        ...postData,
        author: postData.author_name || 'DoRight Team',
        image: postData.featured_image_url,
        date: postData.published_at || postData.created_at,
        category: postData.tags?.[0] || 'General',
        readTime: calculateReadTime(postData.content)
      };

      setPost(formattedPost);

      // Fetch related posts (and also recent posts to reuse for sidebar if needed, but sidebar fetches its own or we pass related)
      // Actually sidebar logic for "Popular Posts" might just use these related ones for visual consistency in this demo
      const { data: related, error: relatedError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', postId)
        .limit(5); // Fetch a few more for sidebar usage

      if (relatedError) throw relatedError;

      const formattedRelated = (related || []).map(post => ({
        ...post,
        author: post.author_name || 'DoRight Team',
        image: post.featured_image_url,
        date: post.published_at || post.created_at,
        category: post.tags?.[0] || 'General',
        readTime: calculateReadTime(post.content)
      }));

      setRelatedPosts(formattedRelated);

    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

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
      className="min-h-screen bg-neutral-50 pt-20"
    >
      <div className="max-w-container mx-auto px-5 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content Area */}
          <div className="lg:col-span-2">

            {/* Header Info */}
            <div className="mb-8">
              <span className="bg-primary text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-neutral-900 mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-neutral-500 border-b border-neutral-200 pb-8">
                <div className="flex items-center font-medium text-neutral-900">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center mr-2 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <SafeIcon icon={FiUser} className="w-4 h-4 text-neutral-500" />
                  </div>
                  by {post.author}
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                  {formatDate(post.date)}
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                  2 Comments {/* Mock data */}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-xl overflow-hidden mb-8 shadow-sm">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>

            {/* Article Content */}
            <article
              className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Article Footer / Share */}
            <div className="mt-12 py-8 border-t border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://doright.ng/#/blog/' + postId)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#3b5998] text-white px-4 py-2 rounded text-sm font-medium flex items-center hover:bg-opacity-90 transition-opacity">
                  <SafeIcon icon={FiFacebook} className="w-4 h-4 mr-2" /> Share
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent('https://doright.ng/#/blog/' + postId)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#1da1f2] text-white px-4 py-2 rounded text-sm font-medium flex items-center hover:bg-opacity-90 transition-opacity">
                  <SafeIcon icon={FiTwitter} className="w-4 h-4 mr-2" /> Tweet
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://doright.ng/#/blog/' + postId)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="bg-[#0A66C2] text-white px-4 py-2 rounded text-sm font-medium flex items-center hover:bg-opacity-90 transition-opacity">
                  <SafeIcon icon={FiLinkedin} className="w-4 h-4 mr-2" /> Share
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + ' https://doright.ng/#/blog/' + postId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-4 py-2 rounded text-sm font-medium flex items-center hover:bg-opacity-90 transition-opacity"
                >
                  <SafeIcon icon={FiMessageCircle} className="w-4 h-4 mr-2" /> WhatsApp
                </a>
              </div>
              <div className="flex gap-2">
                {/* Tags mock */}
                <span className="text-neutral-500 text-sm font-medium mr-2">Tags:</span>
                {['Fashion', 'Lifestyle', 'Tech'].map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors cursor-pointer">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 mt-12 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              <div className="w-20 h-20 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                <SafeIcon icon={FiUser} className="w-full h-full p-4 text-neutral-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-neutral-900 mb-2">{post.author}</h4>
                <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                  Maecenas cursus nibh lusis, quis egestas diam rhoncus ac. Cras tincidunt lacus id feugiat egestas. Condimentum risus sed lectus.
                </p>
                <button className="text-primary text-sm font-bold uppercase tracking-wide hover:underline">Read All Posts</button>
              </div>
            </div>

            {/* Comment Section (Placeholder) */}
            <div className="mt-12">
              <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-8 border-l-4 border-primary pl-4">
                Write a Comment
              </h3>
              <form className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
                <div className="mb-6">
                  <textarea
                    placeholder="Tell us what you think..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-32 resize-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <input type="text" placeholder="Name" className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  <input type="email" placeholder="Email" className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <button type="button" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                  Post Comment
                </button>
              </form>
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar recentPosts={relatedPosts} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts Bottom Section */}
      {relatedPosts.length > 0 && (
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-container mx-auto px-5">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl font-heading font-bold text-neutral-900 relative pl-4 border-l-4 border-primary">
                Related Posts
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <SafeIcon icon={FiIcons.FiChevronLeft} className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <SafeIcon icon={FiIcons.FiChevronRight} className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.slice(0, 4).map((relatedPost) => (
                <Link to={`/blog/${relatedPost.id}`} key={relatedPost.id} className="group">
                  <div className="rounded-lg overflow-hidden h-48 mb-4 relative">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      {relatedPost.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {new Date(relatedPost.date).toLocaleDateString()}
                  </p>
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