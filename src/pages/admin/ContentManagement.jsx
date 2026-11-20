import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import { ImageFieldInput } from '../../cms/fields/imageField';

const { FiEdit, FiSave, FiX, FiPlus, FiTrash2, FiImage } = FiIcons;

const humanizeLabel = (key) =>
  (key || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ContentManagement = () => {
  const [siteSettings, setSiteSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key', { ascending: true });
      if (error) throw error;
      setSiteSettings(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('site_settings')
        .upsert({ ...item, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
      alert('Failed to save: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('site_settings').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  const openEditor = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const closeEditor = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleCreateNew = () => {
    openEditor({ setting_key: '', setting_value: '', setting_type: 'text', description: '' });
  };

  const renderSettingEditor = () => {
    if (!editingItem) return null;
    const isNew = !editingItem.id;
    const type = editingItem.setting_type || 'text';

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Setting ID {isNew && <span className="text-red-500">*</span>}</label>
          <input
            type="text"
            value={editingItem.setting_key || ''}
            disabled={!isNew}
            onChange={(e) => setEditingItem({ ...editingItem, setting_key: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400 disabled:bg-neutral-100 disabled:text-neutral-500"
            placeholder="e.g., site_name, contact_email"
          />
          {!isNew && <p className="text-xs text-neutral-500 mt-1">The ID can't be changed after a setting is created.</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setEditingItem({ ...editingItem, setting_type: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="image">Image</option>
            <option value="json">Advanced (JSON)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Value</label>
          {type === 'json' ? (
            <textarea
              value={typeof editingItem.setting_value === 'object' ? JSON.stringify(editingItem.setting_value, null, 2) : (editingItem.setting_value || '')}
              onChange={(e) => {
                try {
                  setEditingItem({ ...editingItem, setting_value: JSON.parse(e.target.value) });
                } catch (err) {
                  setEditingItem({ ...editingItem, setting_value: e.target.value });
                }
              }}
              rows={8}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
            />
          ) : type === 'image' ? (
            <ImageFieldInput
              field={{ label: '' }}
              showAlt={false}
              value={{ url: typeof editingItem.setting_value === 'string' ? editingItem.setting_value : '', alt: '' }}
              onChange={(img) => setEditingItem({ ...editingItem, setting_value: img.url })}
            />
          ) : (
            <input
              type={type === 'number' ? 'number' : 'text'}
              value={editingItem.setting_value || ''}
              onChange={(e) => setEditingItem({ ...editingItem, setting_value: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Note <span className="text-neutral-400 font-normal">(for other admins, not shown on the site)</span></label>
          <input
            type="text"
            value={editingItem.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal || !editingItem) return null;
    const title = `${editingItem.id ? 'Edit' : 'Add'} Site Setting`;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeEditor}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
            <button onClick={closeEditor} className="p-2 hover:bg-neutral-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {renderSettingEditor()}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={closeEditor}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveItem(editingItem)}
              className="px-6 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 flex items-center gap-2"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              Save
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderSettings = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
    }

    if (siteSettings.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No site information set up yet.</p></div>;
    }

    return (
      <div className="space-y-4">
        {siteSettings.map((setting) => (
          <motion.div key={setting.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900">{humanizeLabel(setting.setting_key)}</h3>
                {setting.description && <p className="text-sm text-neutral-600">{setting.description}</p>}
                {setting.setting_type === 'image' && setting.setting_value ? (
                  <div className="flex items-center gap-2 mt-2">
                    <SafeIcon icon={FiImage} className="w-4 h-4 text-neutral-400" />
                    <img src={setting.setting_value} alt="" className="h-10 w-10 object-cover rounded border border-neutral-200" />
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 mt-1 truncate">
                    {typeof setting.setting_value === 'object' ? JSON.stringify(setting.setting_value) : (setting.setting_value || '—')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  aria-label={`Edit ${humanizeLabel(setting.setting_key)}`}
                  onClick={() => openEditor(setting)}
                  className="p-2 bg-yellow-400 text-black rounded-lg"
                >
                  <SafeIcon icon={FiEdit} className="w-5 h-5" />
                </button>
                <button
                  aria-label={`Delete ${humanizeLabel(setting.setting_key)}`}
                  onClick={() => handleDelete(setting.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg"
                >
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Site Settings</h1>
          <p className="text-neutral-600 mt-1">Site-wide information such as contact details and logos. Page content is edited in Pages.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <div className={`px-4 py-2 rounded-lg ${saveStatus === 'saved' ? 'bg-green-100 text-green-700' : saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
              {saveStatus === 'saved' && 'Saved!'} {saveStatus === 'saving' && 'Saving...'} {saveStatus === 'error' && 'Error'}
            </div>
          )}
          <button onClick={handleCreateNew} className="flex items-center bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500">
            <SafeIcon icon={FiPlus} className="mr-2" /> Add New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        {renderSettings()}
      </div>

      {renderModal()}
    </motion.div>
  );
};

export default ContentManagement;
