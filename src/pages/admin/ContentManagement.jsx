import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiSave, FiX, FiPlus, FiTrash2, FiEye, FiEyeOff, FiSettings, FiUsers, FiCalendar, FiTarget } = FiIcons;

const ContentManagement = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedTab, setSelectedTab] = useState('sections');
  const [sections, setSections] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const pages = [
    { id: 'home', name: 'Home Page', icon: FiTarget },
    { id: 'about', name: 'About Page', icon: FiUsers },
    { id: 'programs', name: 'Programs Page', icon: FiSettings },
    { id: 'events', name: 'Events Page', icon: FiCalendar },
    { id: 'contact', name: 'Contact Page', icon: FiSettings },
    { id: 'trustees', name: 'Trustees Page', icon: FiUsers }
  ];

  const tabs = [
    { id: 'sections', name: 'Page Sections', icon: FiSettings },
    { id: 'team', name: 'Team Members', icon: FiUsers },
    { id: 'programs', name: 'Programs', icon: FiTarget },
    { id: 'events', name: 'Events', icon: FiCalendar },
    { id: 'settings', name: 'Site Settings', icon: FiSettings }
  ];

  useEffect(() => {
    loadData();
  }, [selectedPage, selectedTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (selectedTab === 'sections') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/sections/${selectedPage}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSections(data);
      } else if (selectedTab === 'team') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/team`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setTeamMembers(data);
      } else if (selectedTab === 'programs') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/programs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPrograms(data);
      } else if (selectedTab === 'events') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setEvents(data);
      } else if (selectedTab === 'settings') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section) => {
    try {
      setSaveStatus('saving');
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(section)
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
        loadData();
        setEditingSection(null);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleToggleVisibility = async (sectionId, currentVisibility) => {
    try {
      const token = localStorage.getItem('token');

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/cms/sections/${sectionId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_visible: !currentVisibility })
      });

      loadData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const renderSectionEditor = () => {
    if (editingSection) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingSection(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Edit Section: {editingSection.section_key}
              </h2>
              <button
                onClick={() => setEditingSection(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Section Type
                </label>
                <input
                  type="text"
                  value={editingSection.section_type}
                  onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Position
                </label>
                <input
                  type="number"
                  value={editingSection.position}
                  onChange={(e) => setEditingSection({ ...editingSection, position: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Content Data (JSON)
                </label>
                <textarea
                  value={JSON.stringify(editingSection.content_data, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingSection({ ...editingSection, content_data: parsed });
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={15}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={editingSection.is_visible}
                  onChange={(e) => setEditingSection({ ...editingSection, is_visible: e.target.checked })}
                  className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                />
                <label htmlFor="is_visible" className="ml-2 text-sm text-neutral-700">
                  Visible on website
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSection(editingSection)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const renderSections = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (sections.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">No sections found for this page.</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
            <SafeIcon icon={FiPlus} className="w-4 h-4 inline mr-2" />
            Add Section
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{section.section_key}</h3>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                    {section.section_type}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    Position: {section.position}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">
                  {Object.keys(section.content_data || {}).length} content fields
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                  className={`p-2 rounded-lg transition-colors ${
                    section.is_visible
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                  }`}
                  title={section.is_visible ? 'Visible' : 'Hidden'}
                >
                  <SafeIcon icon={section.is_visible ? FiEye : FiEyeOff} className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditingSection(section)}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="w-5 h-5" />
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
      case 'sections':
        return renderSections();
      case 'team':
      case 'programs':
      case 'events':
      case 'settings':
        return (
          <div className="text-center py-12 text-neutral-600">
            Content editor for {selectedTab} coming soon...
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Content Management</h1>
          <p className="text-neutral-600 mt-1">Edit website content, pages, and sections</p>
        </div>

        {saveStatus && (
          <div className={`px-4 py-2 rounded-lg ${
            saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
            saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
            'bg-red-100 text-red-700'
          }`}>
            {saveStatus === 'saved' && 'Saved successfully!'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'error' && 'Error saving'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Pages</h2>
            <div className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedPage === page.id
                      ? 'bg-primary text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <SafeIcon icon={page.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{page.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Content Type</h2>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedTab === tab.id
                        ? 'bg-accent text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <SafeIcon icon={tab.icon} className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900">
                {pages.find(p => p.id === selectedPage)?.name} - {tabs.find(t => t.id === selectedTab)?.name}
              </h2>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>

      {renderSectionEditor()}
    </motion.div>
  );
};

export default ContentManagement;
