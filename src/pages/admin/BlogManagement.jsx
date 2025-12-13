import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } = FiIcons;

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    status: 'draft',
    tags: []
  });

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      status: 'draft',
      tags: []
    });
    setShowModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url || '',
      status: post.status,
      tags: post.tags || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (formData.status === 'published' && !formData.published_at) {
        postData.published_at = new Date().toISOString();
      }

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        alert('Blog post updated successfully!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        alert('Blog post created successfully!');
      }
      setShowModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save blog post: ' + error.message);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Blog post deleted successfully!');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete blog post');
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blog Management</h1>
        <button 
          onClick={handleCreatePost}
          className="flex items-center bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="mr-2" />
          New Post
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No blog posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4 font-medium">{post.title}</td>
                    <td className="p-4">Admin</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' : 
                        post.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEditPost(post)}
                        className="text-yellow-500 hover:text-yellow-600 mr-4"
                      >
                        <SafeIcon icon={FiEdit2} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    rows="8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500"
                >
                  {editingPost ? 'Update' : 'Create'} Post
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogManagement;