import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiSearch, FiX, FiUser, FiCamera } = FiIcons;

const STATUS_OPTIONS = ['new', 'contacted', 'integrated', 'full_member'];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  integrated: 'Integrated',
  full_member: 'Full Member'
};

const STATUS_BADGE_CLASSES = {
  new: 'bg-gray-200 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  integrated: 'bg-purple-100 text-purple-800',
  full_member: 'bg-green-100 text-green-800'
};

// Timestamp column to stamp when a lead first advances into that status.
const STATUS_TIMESTAMP_FIELD = {
  contacted: 'contacted_at',
  integrated: 'integrated_at',
  full_member: 'full_member_at'
};

const SIGNED_URL_EXPIRY_SECONDS = 300;

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedLead, setSelectedLead] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('new');
  const [saving, setSaving] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*, sub_committees(name)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const openLead = (lead) => {
    setSelectedLead(lead);
    setNoteDraft(lead.admin_notes || '');
    setStatusDraft(lead.status);
    setPhotoUrl(null);

    if (lead.photo_url) {
      setPhotoLoading(true);
      supabase.storage
        .from('lead-photos')
        .createSignedUrl(lead.photo_url, SIGNED_URL_EXPIRY_SECONDS)
        .then(({ data, error }) => {
          if (error) throw error;
          setPhotoUrl(data?.signedUrl || null);
        })
        .catch((error) => {
          console.error('Error creating signed URL for lead photo:', error);
          setPhotoUrl(null);
        })
        .finally(() => setPhotoLoading(false));
    }
  };

  const closeModal = () => {
    setSelectedLead(null);
    setPhotoUrl(null);
    setPhotoLoading(false);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;

    try {
      setSaving(true);
      const updates = {
        admin_notes: noteDraft.trim() ? noteDraft : null,
        status: statusDraft
      };

      const timestampField = STATUS_TIMESTAMP_FIELD[statusDraft];
      if (statusDraft !== selectedLead.status && timestampField) {
        updates[timestampField] = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', selectedLead.id);

      if (error) throw error;

      closeModal();
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to save lead: ' + error.message);
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Leads</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-neutral-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Sub-committee</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openLead(lead)}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="p-4 font-medium">{lead.full_name}</td>
                    <td className="p-4 text-sm">{lead.email}</td>
                    <td className="p-4 text-sm">{lead.phone || '—'}</td>
                    <td className="p-4 text-sm">{lead.sub_committees?.name || '—'}</td>
                    <td className="p-4 text-sm capitalize">{lead.source}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE_CLASSES[lead.status]}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedLead.full_name}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {photoLoading ? (
                  <span className="text-xs text-gray-400">Loading...</span>
                ) : photoUrl ? (
                  <img src={photoUrl} alt={selectedLead.full_name} className="w-full h-full object-cover" />
                ) : (
                  <SafeIcon icon={selectedLead.photo_url ? FiCamera : FiUser} className="h-10 w-10 text-gray-400" />
                )}
              </div>

              <div className="flex-1 space-y-1 text-sm">
                <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedLead.phone || '—'}</p>
                <p><span className="font-medium">Sub-committee:</span> {selectedLead.sub_committees?.name || '—'}</p>
                <p><span className="font-medium">Source:</span> <span className="capitalize">{selectedLead.source}</span></p>
                {selectedLead.source === 'referral' && (
                  <p><span className="font-medium">Referred by:</span> {selectedLead.referred_by || '—'}</p>
                )}
                <p><span className="font-medium">Submitted:</span> {new Date(selectedLead.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Admin Notes</label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                placeholder="Call outcome, follow-up details, interest/message from the join form..."
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLead}
                disabled={saving}
                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LeadsManagement;
