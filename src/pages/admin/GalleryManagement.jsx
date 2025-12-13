import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiUpload, FiEdit2, FiTrash2, FiImage, FiVideo } = FiIcons;

const GalleryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_url: '',
    thumbnail_url: '',
    media_type: 'image',
    category: '',
    is_featured: false
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('position_order', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      alert('Failed to fetch gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      media_url: '',
      thumbnail_url: '',
      media_type: 'image',
      category: '',
      is_featured: false
    });
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url || '',
      media_type: item.media_type,
      category: item.category || '',
      is_featured: item.is_featured
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('Gallery item updated successfully!');
      } else {
        const { error } = await supabase
          .from('gallery_items')
          .insert([formData]);

        if (error) throw error;
        alert('Gallery item created successfully!');
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save gallery item: ' + error.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Gallery item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete gallery item');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gallery Management</h1>
        <button 
          onClick={handleCreateItem}
          className="flex items-center bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <SafeIcon icon={FiUpload} className="mr-2" />
          Upload Media
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No gallery items found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md">
                {item.media_type === 'image' ? (
                  <img 
                    src={item.thumbnail_url || item.media_url} 
                    alt={item.title} 
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <SafeIcon icon={FiVideo} className="text-white text-4xl" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                  {item.category && (
                    <p className="text-gray-300 text-sm">{item.category}</p>
                  )}
                  {item.is_featured && (
                    <span className="text-yellow-400 text-xs mt-1">⭐ Featured</span>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="text-xs bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              {editingItem ? 'Edit Gallery Item' : 'Upload New Media'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Media Type</label>
                  <select
                    value={formData.media_type}
                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Media URL</label>
                  <input
                    type="url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail URL (optional)</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    placeholder="Events, Training, Team, etc."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Featured Item</label>
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
                  {editingItem ? 'Update' : 'Upload'} Media
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default GalleryManagement;