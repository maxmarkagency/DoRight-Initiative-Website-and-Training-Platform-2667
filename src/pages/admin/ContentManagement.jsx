import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { quillModules, quillFormats } from '../../lib/quillConfig';
import RepeatableListEditor from '../../components/admin/RepeatableListEditor';

const {
  FiEdit, FiSave, FiX, FiPlus, FiTrash2, FiEye, FiEyeOff, FiSettings, FiUsers,
  FiCalendar, FiTarget, FiBook, FiChevronDown, FiChevronRight, FiImage
} = FiIcons;

const TABLE_BY_TAB = {
  sections: 'page_sections',
  programs: 'programs',
  team: 'team_members',
  settings: 'site_settings'
};

const TAB_LABELS = {
  sections: 'Section',
  programs: 'Program Card',
  team: 'Team Member',
  settings: 'Site Setting'
};

// content_data on a page_section is a free-form JSON blob; these are the shapes
// actually consumed by the public pages (About.jsx's stats/timeline/values,
// Programs.jsx's programs/impact). Used to offer a one-click starting shape
// instead of asking an admin to hand-write JSON from scratch.
const LIST_TEMPLATES = [
  { key: 'stats', label: 'Stats', item: { number: '', label: '', suffix: '' } },
  { key: 'timeline', label: 'Timeline', item: { year: '', title: '', description: '' } },
  { key: 'values', label: 'Values', item: { icon: 'FiHeart', title: '', description: '' } },
  { key: 'items', label: 'Custom list', item: { label: '', value: '' } }
];

const humanizeLabel = (key) =>
  (key || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const PAGES = [
  { id: 'home', name: 'Home', icon: FiTarget },
  { id: 'about', name: 'About', icon: FiUsers },
  { id: 'programs', name: 'Programs Page', icon: FiBook },
  { id: 'events', name: 'Events', icon: FiCalendar },
  { id: 'contact', name: 'Contact', icon: FiSettings },
  { id: 'trustees', name: 'Trustees', icon: FiUsers }
];

const COLLECTIONS = [
  { id: 'programs', name: 'Program Cards', icon: FiBook },
  { id: 'team', name: 'Team Members', icon: FiUsers },
  { id: 'settings', name: 'Site Information', icon: FiSettings }
];

const ContentManagement = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedTab, setSelectedTab] = useState('sections');
  const [sections, setSections] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase.from('pages').select('id, slug');
      if (error) throw error;
      setPagesData(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const getPageIdBySlug = (slug) => pagesData.find((p) => p.slug === slug)?.id;

  useEffect(() => {
    if (selectedTab !== 'sections' || pagesData.length > 0) {
      loadData();
    }
  }, [selectedPage, selectedTab, pagesData]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (selectedTab === 'sections') {
        const pageId = getPageIdBySlug(selectedPage);
        if (!pageId) {
          setSections([]);
          return;
        }
        const { data, error } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .order('position', { ascending: true });
        if (error) throw error;
        setSections(data || []);
      } else if (selectedTab === 'programs') {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .order('position', { ascending: true });
        if (error) throw error;
        setPrograms(data || []);
      } else if (selectedTab === 'team') {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('position', { ascending: true });
        if (error) throw error;
        setTeamMembers(data || []);
      } else if (selectedTab === 'settings') {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .order('setting_key', { ascending: true });
        if (error) throw error;
        setSiteSettings(data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item) => {
    try {
      setSaveStatus('saving');
      const table = TABLE_BY_TAB[selectedTab];
      const payload = selectedTab === 'sections'
        ? { ...item, page_id: getPageIdBySlug(selectedPage), updated_at: new Date().toISOString() }
        : { ...item, updated_at: new Date().toISOString() };

      const { error } = await supabase.from(table).upsert(payload);

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

  const handleToggleVisibility = async (id, table, field, currentValue) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ [field]: !currentValue, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update: ' + error.message);
    }
  };

  const handleDelete = async (id, table) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  const selectPage = (pageId) => {
    setSelectedTab('sections');
    setSelectedPage(pageId);
  };

  const openEditor = (item) => {
    setEditingItem(item);
    setShowAdvanced(!item.id);
    setShowModal(true);
  };

  const closeEditor = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleCreateNew = () => {
    const defaults = {
      sections: { page_id: getPageIdBySlug(selectedPage), section_key: '', section_type: 'content', position: sections.length, is_active: true },
      programs: { title: '', subtitle: '', description: '', icon: 'FiTarget', features: [], position: programs.length, is_active: true },
      team: { name: '', role: '', bio: '', position: teamMembers.length, is_active: true },
      settings: { setting_key: '', setting_value: '', setting_type: 'text', description: '' }
    };
    openEditor(defaults[selectedTab]);
  };

  const listFieldKey = (contentData) =>
    Object.keys(contentData || {}).find((key) => Array.isArray(contentData[key]));

  const renderSectionEditor = () => {
    if (!editingItem) return null;
    const contentData = editingItem.content_data || {};
    const activeListKey = listFieldKey(contentData);

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Section ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={editingItem.section_key || ''}
            onChange={(e) => setEditingItem({ ...editingItem, section_key: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            placeholder="e.g., hero, mission, stats"
          />
          <p className="text-xs text-neutral-500 mt-1">A short internal name used to place this content on the page. Don't change this on an existing section unless you know it's safe.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
          <input
            type="text"
            value={editingItem.title || ''}
            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={editingItem.subtitle || ''}
            onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Content</label>
          <div className="border border-neutral-300 rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={editingItem.content || ''}
              onChange={(content) => setEditingItem({ ...editingItem, content })}
              modules={quillModules}
              formats={quillFormats}
              className="bg-white"
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
          <input
            type="url"
            value={editingItem.image_url || ''}
            onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">List items</label>
          {activeListKey ? (
            <RepeatableListEditor
              items={contentData[activeListKey]}
              itemLabel={humanizeLabel(activeListKey).replace(/s$/, '')}
              onChange={(items) => setEditingItem({ ...editingItem, content_data: { ...contentData, [activeListKey]: items } })}
            />
          ) : (
            <div className="border border-dashed border-neutral-300 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-3">This section doesn't have a list yet. Some sections (like a stats row or timeline) show a repeating list of items on the page.</p>
              <div className="flex flex-wrap gap-2">
                {LIST_TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, content_data: { [template.key]: [template.item] } })}
                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-100"
                  >
                    + Add {template.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editingItem.is_active !== false}
              onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
              className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
            />
            Visible on website
          </label>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <SafeIcon icon={showAdvanced ? FiChevronDown : FiChevronRight} className="w-4 h-4" />
          Advanced
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 mt-3">Layout Type</label>
              <select
                value={editingItem.section_type || 'text'}
                onChange={(e) => setEditingItem({ ...editingItem, section_type: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
              >
                <option value="hero">Hero</option>
                <option value="text">Text</option>
                <option value="grid">Grid</option>
                <option value="stats">Stats</option>
                <option value="cta">Call to Action</option>
                <option value="timeline">Timeline</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2 mt-3">Display Order</label>
              <input
                type="number"
                value={editingItem.position || 0}
                onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgramEditor = () => {
    if (!editingItem) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
          <input
            type="text"
            value={editingItem.title || ''}
            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={editingItem.subtitle || ''}
            onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
          <textarea
            value={editingItem.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Icon</label>
            <select
              value={editingItem.icon || 'FiTarget'}
              onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            >
              <option value="FiTarget">Target</option>
              <option value="FiUsers">Users</option>
              <option value="FiTrendingUp">Trending Up</option>
              <option value="FiShield">Shield</option>
              <option value="FiBook">Book</option>
              <option value="FiHeart">Heart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Display Order</label>
            <input
              type="number"
              value={editingItem.position || 0}
              onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
          <input
            type="url"
            value={editingItem.image_url || ''}
            onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Features (one per line)</label>
          <textarea
            value={(editingItem.features || []).join('\n')}
            onChange={(e) => setEditingItem({ ...editingItem, features: e.target.value.split('\n').filter(f => f.trim()) })}
            rows={5}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={editingItem.is_active !== false}
            onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
            className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
          />
          Active
        </label>
      </div>
    );
  };

  const renderTeamMemberEditor = () => {
    if (!editingItem) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
            <input
              type="text"
              value={editingItem.name || ''}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
            <input
              type="text"
              value={editingItem.role || ''}
              onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
          <textarea
            value={editingItem.bio || ''}
            onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Image URL</label>
            <input
              type="url"
              value={editingItem.image_url || ''}
              onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <input
              type="email"
              value={editingItem.email || ''}
              onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Display Order</label>
            <input
              type="number"
              value={editingItem.position || 0}
              onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex items-center pt-8">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editingItem.is_active !== false}
                onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
              />
              Active
            </label>
          </div>
        </div>
      </div>
    );
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
            <option value="image">Image URL</option>
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
          ) : (
            <input
              type={type === 'number' ? 'number' : type === 'image' ? 'url' : 'text'}
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

    const getTitle = () => {
      const isNew = !editingItem.id;
      return `${isNew ? 'Add' : 'Edit'} ${TAB_LABELS[selectedTab]}`;
    };

    const renderEditor = () => {
      switch (selectedTab) {
        case 'sections': return renderSectionEditor();
        case 'programs': return renderProgramEditor();
        case 'team': return renderTeamMemberEditor();
        case 'settings': return renderSettingEditor();
        default: return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeEditor}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{getTitle()}</h2>
            <button onClick={closeEditor} className="p-2 hover:bg-neutral-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {renderEditor()}

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

  const renderSections = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
    }

    if (sections.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">No sections found for this page.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sections.map((section) => (
          <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">{section.title || humanizeLabel(section.section_key)}</h3>
                <p className="text-sm text-neutral-600">{section.content ? section.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'No content yet'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleVisibility(section.id, 'page_sections', 'is_active', section.is_active)} className={`p-2 rounded-lg transition-colors ${section.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  <SafeIcon icon={section.is_active ? FiEye : FiEyeOff} className="w-5 h-5" />
                </button>
                <button onClick={() => openEditor(section)} className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500">
                  <SafeIcon icon={FiEdit} className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(section.id, 'page_sections')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPrograms = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
    }

    if (programs.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No program cards found.</p></div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <motion.div key={program.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex gap-4">
              {program.image_url && <img src={program.image_url} alt={program.title} className="w-24 h-24 object-cover rounded-lg" />}
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{program.title}</h3>
                <p className="text-sm text-neutral-600">{program.subtitle}</p>
                <p className="text-xs text-neutral-500 mt-1">{program.features?.length || 0} features</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleToggleVisibility(program.id, 'programs', 'is_active', program.is_active)} className={`p-2 rounded-lg ${program.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  <SafeIcon icon={program.is_active ? FiEye : FiEyeOff} className="w-4 h-4" />
                </button>
                <button onClick={() => openEditor(program)} className="p-2 bg-yellow-400 text-black rounded-lg">
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(program.id, 'programs')} className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTeamMembers = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
    }

    if (teamMembers.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No team members found.</p></div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center gap-4 mb-3">
              {member.image_url ? <img src={member.image_url} alt={member.name} className="w-16 h-16 object-cover rounded-full" /> : <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center"><SafeIcon icon={FiUsers} className="w-8 h-8 text-neutral-400" /></div>}
              <div>
                <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                <p className="text-sm text-neutral-600">{member.role}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => handleToggleVisibility(member.id, 'team_members', 'is_active', member.is_active)} className={`p-2 rounded-lg ${member.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                <SafeIcon icon={member.is_active ? FiEye : FiEyeOff} className="w-4 h-4" />
              </button>
              <button onClick={() => openEditor(member)} className="p-2 bg-yellow-400 text-black rounded-lg">
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(member.id, 'team_members')} className="p-2 bg-red-100 text-red-600 rounded-lg">
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
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
                <button onClick={() => openEditor(setting)} className="p-2 bg-yellow-400 text-black rounded-lg">
                  <SafeIcon icon={FiEdit} className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(setting.id, 'site_settings')} className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'sections': return renderSections();
      case 'programs': return renderPrograms();
      case 'team': return renderTeamMembers();
      case 'settings': return renderSettings();
      default: return null;
    }
  };

  const currentPage = PAGES.find((p) => p.id === selectedPage);
  const currentCollection = COLLECTIONS.find((c) => c.id === selectedTab);
  const heading = selectedTab === 'sections' ? `${currentPage?.name} Page` : currentCollection?.name;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Content Management</h1>
          <p className="text-neutral-600 mt-1">Edit what appears on the website, page by page</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Pages</h2>
            <div className="space-y-1 mb-6">
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => selectPage(page.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedTab === 'sections' && selectedPage === page.id ? 'bg-yellow-400 text-black font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}
                >
                  <SafeIcon icon={page.icon} className="w-4 h-4" />
                  <span className="text-sm">{page.name}</span>
                </button>
              ))}
            </div>

            <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Other Content</h2>
            <div className="space-y-1">
              {COLLECTIONS.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedTab(collection.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedTab === collection.id ? 'bg-neutral-800 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                >
                  <SafeIcon icon={collection.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{collection.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900">{heading}</h2>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>

      {renderModal()}
    </motion.div>
  );
};

export default ContentManagement;
