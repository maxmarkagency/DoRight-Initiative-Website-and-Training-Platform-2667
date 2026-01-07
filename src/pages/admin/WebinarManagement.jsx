import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import MediaUpload from '../../components/admin/MediaUpload';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiPlus, FiSearch, FiEdit2, FiTrash2, FiVideo } = FiIcons;

const WebinarManagement = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    presenter: '',
    date: '',
    duration_minutes: 60,
    meeting_link: '',
    registration_link: '',
    image_url: '',
    max_participants: null,
    is_published: false,
    tags: []
  });

  useEffect(() => {
    fetchWebinars();
  }, [searchTerm, publishedFilter]);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('webinars')
        .select('*')
        .order('date', { ascending: false });

      if (publishedFilter !== 'all') {
        query = query.eq('is_published', publishedFilter === 'published');
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWebinars(data || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
      alert('Failed to fetch webinars');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebinar = () => {
    setEditingWebinar(null);
    setFormData({
      title: '',
      description: '',
      presenter: '',
      date: '',
      duration_minutes: 60,
      meeting_link: '',
      registration_link: '',
      image_url: '',
      max_participants: null,
      is_published: false,
      tags: []
    });
    setShowModal(true);
  };

  const handleUploadSuccess = (file) => {
    setFormData(prev => ({
      ...prev,
      image_url: file.url
    }));
  };

  const handleEditWebinar = (webinar) => {
    setEditingWebinar(webinar);
    setFormData({
      title: webinar.title,
      description: webinar.description,
      presenter: webinar.presenter,
      date: new Date(webinar.date).toISOString().slice(0, 16),
      duration_minutes: webinar.duration_minutes,
      meeting_link: webinar.meeting_link || '',
      registration_link: webinar.registration_link || '',
      image_url: webinar.image_url || '',
      max_participants: webinar.max_participants || null,
      is_published: webinar.is_published,
      tags: webinar.tags || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const webinarData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        updated_at: new Date().toISOString()
      };

      if (editingWebinar) {
        const { error } = await supabase
          .from('webinars')
          .update(webinarData)
          .eq('id', editingWebinar.id);

        if (error) throw error;
        alert('Webinar updated successfully!');
      } else {
        const { error } = await supabase
          .from('webinars')
          .insert([webinarData]);

        if (error) throw error;
        alert('Webinar created successfully!');
      }
      setShowModal(false);
      fetchWebinars();
    } catch (error) {
      console.error('Error saving webinar:', error);
      alert('Failed to save webinar: ' + error.message);
    }
  };

  const handleDeleteWebinar = async (id) => {
    if (!confirm('Are you sure you want to delete this webinar?')) return;

    try {
      const { error } = await supabase
        .from('webinars')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Webinar deleted successfully!');
      fetchWebinars();
    } catch (error) {
      console.error('Error deleting webinar:', error);
      alert('Failed to delete webinar');
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Webinar Management</h1>
        <button
          onClick={handleCreateWebinar}
          className="flex items-center bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="mr-2" />
          New Webinar
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search webinars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Webinars</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : webinars.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No webinars found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Title</th>
                  <th className="p-4">Presenter</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webinars.map(webinar => (
                  <tr key={webinar.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-4 font-medium">{webinar.title}</td>
                    <td className="p-4">{webinar.presenter}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(webinar.date).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">{webinar.duration_minutes} min</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        webinar.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {webinar.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleEditWebinar(webinar)}
                        className="text-yellow-500 hover:text-yellow-600 mr-4"
                      >
                        <SafeIcon icon={FiEdit2} />
                      </button>
                      <button
                        onClick={() => handleDeleteWebinar(webinar.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingWebinar ? 'Edit Webinar' : 'Create New Webinar'}
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
                    rows="4"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Presenter</label>
                    <input
                      type="text"
                      value={formData.presenter}
                      onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date and Time</label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Registration Link</label>
                  <input
                    type="url"
                    value={formData.registration_link}
                    onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Webinar Image</label>
                  <MediaUpload
                    onUploadSuccess={handleUploadSuccess}
                    allowedTypes="image"
                  />
                  {formData.image_url && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      Image uploaded successfully!
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    placeholder="Upload an image or enter URL manually"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={formData.max_participants || ''}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium">
                    Publish webinar
                  </label>
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
                  {editingWebinar ? 'Update' : 'Create'} Webinar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default WebinarManagement;
