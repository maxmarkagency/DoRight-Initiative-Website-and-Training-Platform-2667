import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';
import { getActiveSubCommittees } from '../../services/leadsService';

const { FiSearch, FiX, FiUser, FiCamera, FiPlus } = FiIcons;

const EMPTY_REFERRAL_FORM = { fullName: '', email: '', phone: '', subCommitteeId: '', referredBy: '' };

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

  const [subCommittees, setSubCommittees] = useState([]);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralForm, setReferralForm] = useState(EMPTY_REFERRAL_FORM);
  const [referralSaving, setReferralSaving] = useState(false);
  const [referralError, setReferralError] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    getActiveSubCommittees().then(setSubCommittees);
  }, []);

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

  const openReferralForm = () => {
    setReferralForm(EMPTY_REFERRAL_FORM);
    setReferralError('');
    setShowReferralForm(true);
  };

  const closeReferralForm = () => {
    setShowReferralForm(false);
    setReferralForm(EMPTY_REFERRAL_FORM);
    setReferralError('');
  };

  const handleReferralFieldChange = (e) => {
    const { name, value } = e.target;
    setReferralForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();

    try {
      setReferralSaving(true);
      setReferralError('');

      const { error } = await supabase
        .from('leads')
        .insert({
          full_name: referralForm.fullName.trim(),
          email: referralForm.email.trim(),
          phone: referralForm.phone.trim(),
          sub_committee_id: referralForm.subCommitteeId || null,
          referred_by: referralForm.referredBy.trim(),
          source: 'referral'
        });

      if (error) throw error;

      closeReferralForm();
      fetchLeads();
    } catch (error) {
      console.error('Error creating referral lead:', error);
      setReferralError('Failed to save referral: ' + error.message);
    } finally {
      setReferralSaving(false);
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
        <button
          type="button"
          onClick={openReferralForm}
          className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 inline-flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          New Referral
        </button>
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

      {showReferralForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">New Referral Lead</h2>
              <button onClick={closeReferralForm} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={referralForm.fullName}
                  onChange={handleReferralFieldChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={referralForm.email}
                  onChange={handleReferralFieldChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={referralForm.phone}
                  onChange={handleReferralFieldChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sub-committee Preference</label>
                <select
                  name="subCommitteeId"
                  value={referralForm.subCommitteeId}
                  onChange={handleReferralFieldChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select a sub-committee</option>
                  {subCommittees.map((committee) => (
                    <option key={committee.id} value={committee.id}>{committee.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Referred By</label>
                <input
                  type="text"
                  name="referredBy"
                  value={referralForm.referredBy}
                  onChange={handleReferralFieldChange}
                  required
                  placeholder="Name of the referee who collected this lead"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {referralError && (
                <p className="text-red-600 text-sm">{referralError}</p>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeReferralForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={referralSaving}
                  className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                >
                  {referralSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LeadsManagement;
