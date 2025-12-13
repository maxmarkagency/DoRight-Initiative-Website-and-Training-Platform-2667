import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiEdit, FiSave, FiX, FiPlus, FiTrash2, FiEye, FiEyeOff, FiSettings, FiUsers, FiCalendar, FiTarget, FiLayers, FiBook } = FiIcons;

const ContentManagement = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedTab, setSelectedTab] = useState('sections');
  const [sections, setSections] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const pages = [
    { id: 'home', name: 'Home Page', icon: FiTarget },
    { id: 'about', name: 'About Page', icon: FiUsers },
    { id: 'programs', name: 'Programs Page', icon: FiBook },
    { id: 'events', name: 'Events Page', icon: FiCalendar },
    { id: 'contact', name: 'Contact Page', icon: FiSettings },
    { id: 'trustees', name: 'Trustees Page', icon: FiUsers }
  ];

  const tabs = [
    { id: 'sections', name: 'Page Sections', icon: FiLayers },
    { id: 'programs', name: 'Programs', icon: FiTarget },
    { id: 'team', name: 'Team Members', icon: FiUsers },
    { id: 'events', name: 'Events', icon: FiCalendar },
    { id: 'settings', name: 'Site Settings', icon: FiSettings }
  ];

  useEffect(() => {
    loadData();
  }, [selectedPage, selectedTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (selectedTab === 'sections') {
        const { data, error } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_key', selectedPage)
          .order('position', { ascending: true });

        if (error) throw error;
        setSections(data || []);
      } else if (selectedTab === 'team') {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;
        setTeamMembers(data || []);
      } else if (selectedTab === 'programs') {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .order('position', { ascending: true });

        if (error) throw error;
        setPrograms(data || []);
      } else if (selectedTab === 'events') {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: false });

        if (error) throw error;
        setEvents(data || []);
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
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('page_sections')
        .upsert({
          ...section,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving section:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 2000);
      alert('Failed to save: ' + error.message);
    }
  };

  const handleSaveProgram = async (program) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('programs')
        .upsert({
          ...program,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving program:', error);
      setSaveStatus('error');
      alert('Failed to save: ' + error.message);
    }
  };

  const handleSaveTeamMember = async (member) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('team_members')
        .upsert({
          ...member,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving team member:', error);
      setSaveStatus('error');
      alert('Failed to save: ' + error.message);
    }
  };

  const handleSaveEvent = async (event) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('events')
        .upsert({
          ...event,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving event:', error);
      setSaveStatus('error');
      alert('Failed to save: ' + error.message);
    }
  };

  const handleSaveSetting = async (setting) => {
    try {
      setSaveStatus('saving');
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          ...setting,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      loadData();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving setting:', error);
      setSaveStatus('error');
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

  const handleCreateNew = () => {
    if (selectedTab === 'sections') {
      setEditingItem({
        page_key: selectedPage,
        section_key: '',
        section_type: 'text',
        title: '',
        subtitle: '',
        content: '',
        content_data: {},
        image_url: '',
        position: sections.length,
        is_visible: true
      });
    } else if (selectedTab === 'programs') {
      setEditingItem({
        title: '',
        subtitle: '',
        description: '',
        icon: 'FiTarget',
        image_url: '',
        features: [],
        position: programs.length,
        is_active: true
      });
    } else if (selectedTab === 'team') {
      setEditingItem({
        name: '',
        role: '',
        bio: '',
        image_url: '',
        email: '',
        social_links: {},
        position: teamMembers.length,
        is_active: true
      });
    } else if (selectedTab === 'events') {
      setEditingItem({
        title: '',
        description: '',
        event_date: '',
        end_date: '',
        location: '',
        image_url: '',
        event_type: 'event',
        registration_url: '',
        is_featured: false,
        is_active: true
      });
    } else if (selectedTab === 'settings') {
      setEditingItem({
        setting_key: '',
        setting_value: '',
        setting_type: 'text',
        description: ''
      });
    }
    setShowModal(true);
  };

  const renderSectionEditor = () => {
    if (!editingItem) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Section Key</label>
            <input
              type="text"
              value={editingItem.section_key || ''}
              onChange={(e) => setEditingItem({ ...editingItem, section_key: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
              placeholder="e.g., hero, stats, about"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Section Type</label>
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
          <textarea
            value={editingItem.content || ''}
            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          />
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
          <label className="block text-sm font-medium text-neutral-700 mb-2">Content Data (JSON)</label>
          <textarea
            value={JSON.stringify(editingItem.content_data || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setEditingItem({ ...editingItem, content_data: parsed });
              } catch (err) {}
            }}
            rows={8}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Position</label>
            <input
              type="number"
              value={editingItem.position || 0}
              onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex items-center pt-8">
            <input
              type="checkbox"
              id="is_visible"
              checked={editingItem.is_visible !== false}
              onChange={(e) => setEditingItem({ ...editingItem, is_visible: e.target.checked })}
              className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
            />
            <label htmlFor="is_visible" className="ml-2 text-sm text-neutral-700">Visible on website</label>
          </div>
        </div>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Position</label>
            <input
              type="number"
              value={editingItem.position || 0}
              onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value) })}
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={editingItem.is_active !== false}
            onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
            className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-neutral-700">Active</label>
        </div>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Position</label>
            <input
              type="number"
              value={editingItem.position || 0}
              onChange={(e) => setEditingItem({ ...editingItem, position: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex items-center pt-8">
            <input
              type="checkbox"
              id="is_active_team"
              checked={editingItem.is_active !== false}
              onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
              className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
            />
            <label htmlFor="is_active_team" className="ml-2 text-sm text-neutral-700">Active</label>
          </div>
        </div>
      </div>
    );
  };

  const renderEventEditor = () => {
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Event Date</label>
            <input
              type="datetime-local"
              value={editingItem.event_date ? new Date(editingItem.event_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditingItem({ ...editingItem, event_date: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
            <input
              type="datetime-local"
              value={editingItem.end_date ? new Date(editingItem.end_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditingItem({ ...editingItem, end_date: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
            <input
              type="text"
              value={editingItem.location || ''}
              onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Event Type</label>
            <select
              value={editingItem.event_type || 'event'}
              onChange={(e) => setEditingItem({ ...editingItem, event_type: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            >
              <option value="event">Event</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
            </select>
          </div>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">Registration URL</label>
            <input
              type="url"
              value={editingItem.registration_url || ''}
              onChange={(e) => setEditingItem({ ...editingItem, registration_url: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={editingItem.is_featured || false}
              onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
              className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 text-sm text-neutral-700">Featured</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_event"
              checked={editingItem.is_active !== false}
              onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
              className="w-4 h-4 text-yellow-400 focus:ring-yellow-400 border-neutral-300 rounded"
            />
            <label htmlFor="is_active_event" className="ml-2 text-sm text-neutral-700">Active</label>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingEditor = () => {
    if (!editingItem) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Setting Key</label>
            <input
              type="text"
              value={editingItem.setting_key || ''}
              onChange={(e) => setEditingItem({ ...editingItem, setting_key: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
              placeholder="e.g., site_name, contact_email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Type</label>
            <select
              value={editingItem.setting_type || 'text'}
              onChange={(e) => setEditingItem({ ...editingItem, setting_type: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="image">Image URL</option>
              <option value="number">Number</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Value</label>
          <textarea
            value={typeof editingItem.setting_value === 'object' ? JSON.stringify(editingItem.setting_value, null, 2) : (editingItem.setting_value || '')}
            onChange={(e) => {
              let val = e.target.value;
              if (editingItem.setting_type === 'json') {
                try {
                  val = JSON.parse(e.target.value);
                } catch (err) {
                  val = e.target.value;
                }
              }
              setEditingItem({ ...editingItem, setting_value: val });
            }}
            rows={editingItem.setting_type === 'json' ? 8 : 2}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-400 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
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
      if (selectedTab === 'sections') return isNew ? 'Add Section' : 'Edit Section';
      if (selectedTab === 'programs') return isNew ? 'Add Program' : 'Edit Program';
      if (selectedTab === 'team') return isNew ? 'Add Team Member' : 'Edit Team Member';
      if (selectedTab === 'events') return isNew ? 'Add Event' : 'Edit Event';
      if (selectedTab === 'settings') return isNew ? 'Add Setting' : 'Edit Setting';
      return 'Edit';
    };

    const handleSave = () => {
      if (selectedTab === 'sections') handleSaveSection(editingItem);
      else if (selectedTab === 'programs') handleSaveProgram(editingItem);
      else if (selectedTab === 'team') handleSaveTeamMember(editingItem);
      else if (selectedTab === 'events') handleSaveEvent(editingItem);
      else if (selectedTab === 'settings') handleSaveSetting(editingItem);
    };

    const renderEditor = () => {
      if (selectedTab === 'sections') return renderSectionEditor();
      if (selectedTab === 'programs') return renderProgramEditor();
      if (selectedTab === 'team') return renderTeamMemberEditor();
      if (selectedTab === 'events') return renderEventEditor();
      if (selectedTab === 'settings') return renderSettingEditor();
      return null;
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEditingItem(null); }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{getTitle()}</h2>
            <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="p-2 hover:bg-neutral-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {renderEditor()}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => { setShowModal(false); setEditingItem(null); }}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
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
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
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
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{section.title || section.section_key}</h3>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">{section.section_type}</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Position: {section.position}</span>
                </div>
                <p className="text-sm text-neutral-600">{section.content ? section.content.substring(0, 100) + '...' : 'No content'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleVisibility(section.id, 'page_sections', 'is_visible', section.is_visible)} className={`p-2 rounded-lg transition-colors ${section.is_visible ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  <SafeIcon icon={section.is_visible ? FiEye : FiEyeOff} className="w-5 h-5" />
                </button>
                <button onClick={() => { setEditingItem(section); setShowModal(true); }} className="p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500">
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
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
    }

    if (programs.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No programs found.</p></div>;
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
                <button onClick={() => { setEditingItem(program); setShowModal(true); }} className="p-2 bg-yellow-400 text-black rounded-lg">
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
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
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
              <button onClick={() => { setEditingItem(member); setShowModal(true); }} className="p-2 bg-yellow-400 text-black rounded-lg">
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

  const renderEvents = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
    }

    if (events.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No events found.</p></div>;
    }

    return (
      <div className="space-y-4">
        {events.map((event) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{event.event_type}</span>
                  {event.is_featured && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Featured</span>}
                </div>
                <p className="text-sm text-neutral-600">{event.location}</p>
                {event.event_date && <p className="text-xs text-neutral-500">{new Date(event.event_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggleVisibility(event.id, 'events', 'is_active', event.is_active)} className={`p-2 rounded-lg ${event.is_active ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                  <SafeIcon icon={event.is_active ? FiEye : FiEyeOff} className="w-5 h-5" />
                </button>
                <button onClick={() => { setEditingItem(event); setShowModal(true); }} className="p-2 bg-yellow-400 text-black rounded-lg">
                  <SafeIcon icon={FiEdit} className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(event.id, 'events')} className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderSettings = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
    }

    if (siteSettings.length === 0) {
      return <div className="text-center py-12"><p className="text-neutral-600 mb-4">No settings found.</p></div>;
    }

    return (
      <div className="space-y-4">
        {siteSettings.map((setting) => (
          <motion.div key={setting.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-neutral-900">{setting.setting_key}</h3>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">{setting.setting_type}</span>
                </div>
                <p className="text-sm text-neutral-600">{setting.description}</p>
                <p className="text-xs text-neutral-500 mt-1 font-mono">{typeof setting.setting_value === 'object' ? JSON.stringify(setting.setting_value) : setting.setting_value}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingItem(setting); setShowModal(true); }} className="p-2 bg-yellow-400 text-black rounded-lg">
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
      case 'events': return renderEvents();
      case 'settings': return renderSettings();
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Content Management</h1>
          <p className="text-neutral-600 mt-1">Edit website content, pages, and sections</p>
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
            {selectedTab === 'sections' && (
              <>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Pages</h2>
                <div className="space-y-1 mb-6">
                  {pages.map((page) => (
                    <button key={page.id} onClick={() => setSelectedPage(page.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedPage === page.id ? 'bg-yellow-400 text-black font-semibold' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                      <SafeIcon icon={page.icon} className="w-4 h-4" />
                      <span className="text-sm">{page.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <h2 className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Content Type</h2>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedTab === tab.id ? 'bg-neutral-800 text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}>
                  <SafeIcon icon={tab.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-neutral-900">
                {selectedTab === 'sections' ? `${pages.find(p => p.id === selectedPage)?.name} - Sections` : tabs.find(t => t.id === selectedTab)?.name}
              </h2>
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
