import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import AdminModal from '../../components/admin/AdminModal';
import * as FiIcons from 'react-icons/fi';
import MemberCard from '../../components/MemberCard';
import supabase from '../../lib/supabase';
import {
  TIERS,
  TIER_KEYS,
  getActiveSubCommittees,
  updateLeadTier,
  sendTierNotificationEmail,
  getTierWhatsAppLinks,
  saveTierWhatsAppLinks,
  DEFAULT_TIER_WHATSAPP_LINKS
} from '../../services/leadsService';

const {
  FiX,
  FiUser,
  FiCamera,
  FiPlus,
  FiSearch,
  FiMail,
  FiPhone,
  FiArrowRight,
  FiCheckCircle,
  FiSend,
  FiAward,
  FiClock,
  FiTrendingUp,
  FiLayers,
  FiAlertCircle,
  FiCreditCard,
  FiMessageCircle,
  FiExternalLink
} = FiIcons;

const EMPTY_REFERRAL_FORM = {
  fullName: '',
  email: '',
  phone: '',
  interest: 'Volunteering',
  tier: 'tier_1',
  referredBy: '',
  adminNotes: ''
};

const SIGNED_URL_EXPIRY_SECONDS = 300;

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierTab, setSelectedTierTab] = useState('all');

  // Selected Lead for Tier Management Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('tier'); // 'tier' | 'card'
  const [targetTier, setTargetTier] = useState('tier_1');
  const [noteDraft, setNoteDraft] = useState('');
  const [customEmailNote, setCustomEmailNote] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [savingTier, setSavingTier] = useState(false);
  const [tierActionSuccess, setTierActionSuccess] = useState('');
  const [tierActionError, setTierActionError] = useState('');

  // Photo
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Referral Modal
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralForm, setReferralForm] = useState(EMPTY_REFERRAL_FORM);
  const [referralSaving, setReferralSaving] = useState(false);
  const [referralError, setReferralError] = useState('');

  // WhatsApp Communities Management Modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppLinks, setWhatsAppLinks] = useState(DEFAULT_TIER_WHATSAPP_LINKS);
  const [whatsAppSaving, setWhatsAppSaving] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState('');
  const [whatsAppError, setWhatsAppError] = useState('');

  // Sub-committees (for legacy view if referenced)
  const [subCommittees, setSubCommittees] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    getActiveSubCommittees().then(setSubCommittees);
    getTierWhatsAppLinks().then(setWhatsAppLinks);
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*, sub_committees(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normalise tier for any legacy records without tier field
      const normalised = (data || []).map((item) => ({
        ...item,
        tier: item.tier || 'tier_1'
      }));

      setLeads(normalised);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tier counts
  const counts = {
    all: leads.length,
    tier_1: leads.filter((l) => (l.tier || 'tier_1') === 'tier_1').length,
    tier_2: leads.filter((l) => l.tier === 'tier_2').length,
    tier_3: leads.filter((l) => l.tier === 'tier_3').length
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const currentTier = lead.tier || 'tier_1';
    if (selectedTierTab !== 'all' && currentTier !== selectedTierTab) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = lead.full_name?.toLowerCase().includes(term);
      const matchEmail = lead.email?.toLowerCase().includes(term);
      const matchPhone = lead.phone?.toLowerCase().includes(term);
      const matchNotes = lead.admin_notes?.toLowerCase().includes(term);
      return matchName || matchEmail || matchPhone || matchNotes;
    }
    return true;
  });

  const openLeadModal = (lead, initialTab = 'tier') => {
    setSelectedLead(lead);
    setActiveModalTab(initialTab);
    const currentTier = lead.tier || 'tier_1';
    setTargetTier(currentTier);
    setNoteDraft(lead.admin_notes || '');
    setCustomEmailNote('');
    setSendEmailNotification(true);
    setTierActionSuccess('');
    setTierActionError('');
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
        .catch((err) => {
          console.error('Error creating signed URL for lead photo:', err);
          setPhotoUrl(null);
        })
        .finally(() => setPhotoLoading(false));
    }
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setPhotoUrl(null);
    setPhotoLoading(false);
    setTierActionSuccess('');
    setTierActionError('');
  };

  const handleSaveTier = async () => {
    if (!selectedLead) return;

    try {
      setSavingTier(true);
      setTierActionError('');
      setTierActionSuccess('');

      const oldTier = selectedLead.tier || 'tier_1';
      const isPromoting = targetTier !== oldTier;

      // Append tier change log to admin notes
      let updatedNotes = noteDraft;
      if (isPromoting) {
        const timestamp = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const tierLog = `\n[Tier Updated: ${TIERS[oldTier]?.label || oldTier} ➔ ${TIERS[targetTier]?.label || targetTier} on ${timestamp}]`;
        updatedNotes = updatedNotes ? `${updatedNotes.trim()}${tierLog}` : tierLog.trim();
      }

      await updateLeadTier({
        lead: selectedLead,
        newTier: targetTier,
        adminNotes: updatedNotes,
        sendEmail: sendEmailNotification && isPromoting,
        customEmailNotes: customEmailNote
      });

      setTierActionSuccess(
        isPromoting
          ? `Successfully moved to ${TIERS[targetTier]?.label}! ${sendEmailNotification ? 'Notification email dispatched.' : ''}`
          : 'Member details saved successfully.'
      );

      // Refresh list
      await fetchLeads();

      setTimeout(() => {
        closeLeadModal();
      }, 1400);
    } catch (err) {
      console.error('Error saving tier:', err);
      setTierActionError('Failed to save tier changes: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingTier(false);
    }
  };

  // Quick move to next tier directly from table
  const handleQuickAdvance = async (e, lead, nextTier) => {
    e.stopPropagation();
    const leadName = lead.full_name || 'this member';
    const confirmMsg = `Move ${leadName} to ${TIERS[nextTier]?.label} (${TIERS[nextTier]?.name}) and send an automated notification email?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const oldTier = lead.tier || 'tier_1';
      const timestamp = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const tierLog = `\n[Tier Promoted: ${TIERS[oldTier]?.label || oldTier} ➔ ${TIERS[nextTier]?.label || nextTier} on ${timestamp}]`;
      const updatedNotes = lead.admin_notes ? `${lead.admin_notes.trim()}${tierLog}` : tierLog.trim();

      await updateLeadTier({
        lead,
        newTier: nextTier,
        adminNotes: updatedNotes,
        sendEmail: true
      });
      await fetchLeads();
    } catch (err) {
      console.error('Error during quick advance:', err);
      alert('Failed to update tier: ' + err.message);
    } finally {
      setLoading(false);
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

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      setReferralSaving(true);
      setReferralError('');

      const now = new Date().toISOString();
      const { error } = await supabase.from('leads').insert({
        full_name: referralForm.fullName.trim(),
        email: referralForm.email.trim(),
        phone: referralForm.phone.trim(),
        tier: referralForm.tier || 'tier_1',
        tier_1_at: now,
        referred_by: referralForm.referredBy.trim(),
        source: 'referral',
        admin_notes: referralForm.adminNotes ? `Interest: ${referralForm.interest}\n${referralForm.adminNotes}` : `Interest: ${referralForm.interest}`
      });

      if (error) throw error;

      closeReferralForm();
      fetchLeads();
    } catch (error) {
      console.error('Error creating referral:', error);
      setReferralError('Failed to save referral: ' + error.message);
    } finally {
      setReferralSaving(false);
    }
  };

  const handleSaveWhatsApp = async (e) => {
    e?.preventDefault();
    setWhatsAppSaving(true);
    setWhatsAppSuccess('');
    setWhatsAppError('');

    try {
      const updated = await saveTierWhatsAppLinks(whatsAppLinks);
      setWhatsAppLinks(updated);
      setWhatsAppSuccess('WhatsApp group links updated successfully!');
      setTimeout(() => setWhatsAppSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving WhatsApp links:', err);
      setWhatsAppError('Failed to save links: ' + err.message);
    } finally {
      setWhatsAppSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 sm:p-8 space-y-6"
    >
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>Members & Tier Management</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track user form submissions, promote members across tiers, manage WhatsApp community links, and trigger automated emails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setWhatsAppSuccess('');
              setWhatsAppError('');
              setShowWhatsAppModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm text-sm"
            title="Edit WhatsApp community group links for each tier"
          >
            <SafeIcon icon={FiMessageCircle} className="h-4 w-4" />
            <span>Tier WhatsApp Groups</span>
          </button>
          <button
            type="button"
            onClick={openReferralForm}
            className="px-4 py-2.5 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors inline-flex items-center gap-2 shadow-sm text-sm"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            <span>Add Referral Member</span>
          </button>
        </div>
      </div>

      {/* Tier Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Members */}
        <div
          onClick={() => setSelectedTierTab('all')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            selectedTierTab === 'all'
              ? 'bg-white dark:bg-gray-800 border-yellow-400 ring-2 ring-yellow-400/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Members</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <SafeIcon icon={FiLayers} className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{counts.all}</div>
          <div className="text-xs text-gray-500 mt-1">Total registered leads</div>
        </div>

        {/* Tier 1 */}
        <div
          onClick={() => setSelectedTierTab('tier_1')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            selectedTierTab === 'tier_1'
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 ring-2 ring-blue-400/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Tier 1: Personal Advocate</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_1}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Lead by daily personal example</div>
        </div>

        {/* Tier 2 */}
        <div
          onClick={() => setSelectedTierTab('tier_2')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            selectedTierTab === 'tier_2'
              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Tier 2: Movement Champion</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <SafeIcon icon={FiTrendingUp} className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_2}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Public outreach & mobilization</div>
        </div>

        {/* Tier 3 */}
        <div
          onClick={() => setSelectedTierTab('tier_3')}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            selectedTierTab === 'tier_3'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tier 3: Strategic Leader</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <SafeIcon icon={FiAward} className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_3}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Operational & committee leadership</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Filter Tabs & Search Bar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tier Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-lg">
            <button
              onClick={() => setSelectedTierTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedTierTab === 'all'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setSelectedTierTab('tier_1')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedTierTab === 'tier_1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              Tier 1 ({counts.tier_1})
            </button>
            <button
              onClick={() => setSelectedTierTab('tier_2')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedTierTab === 'tier_2'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              Tier 2 ({counts.tier_2})
            </button>
            <button
              onClick={() => setSelectedTierTab('tier_3')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedTierTab === 'tier_3'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              Tier 3 ({counts.tier_3})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member name, email, phone..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading members...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No members found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your tier filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Current Tier</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Tier Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => {
                  const currentTier = lead.tier || 'tier_1';
                  const tierConfig = TIERS[currentTier] || TIERS.tier_1;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openLeadModal(lead)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0 text-sm">
                            {lead.full_name ? lead.full_name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{lead.full_name}</div>
                            <div className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                              {lead.membership_id || 'DRAI-2026-PENDING'}
                            </div>
                            {lead.referred_by && (
                              <div className="text-xs text-gray-500">Ref: {lead.referred_by}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="text-gray-900 dark:text-gray-200">{lead.email}</div>
                        <div className="text-xs text-gray-500">{lead.phone || '—'}</div>
                      </td>

                      {/* Source */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                          {lead.source || 'website'}
                        </span>
                      </td>

                      {/* Tier Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tierConfig.badgeClass}`}>
                          {tierConfig.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Quick Move Action */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openLeadModal(lead, 'card')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition-colors inline-flex items-center gap-1"
                            title="View Virtual ID Card"
                          >
                            <SafeIcon icon={FiCreditCard} className="w-3 h-3" />
                            <span>Card</span>
                          </button>
                          {currentTier === 'tier_1' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdvance(e, lead, 'tier_2')}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors inline-flex items-center gap-1"
                              title="Promote directly to Tier 2"
                            >
                              <span>Promote to Tier 2</span>
                              <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
                            </button>
                          )}
                          {currentTier === 'tier_2' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdvance(e, lead, 'tier_3')}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors inline-flex items-center gap-1"
                              title="Promote directly to Tier 3"
                            >
                              <span>Promote to Tier 3</span>
                              <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openLeadModal(lead, 'tier')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tier Management & Promotion Modal */}
      <AdminModal isOpen={!!selectedLead} maxWidth="max-w-2xl">
        {selectedLead && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.full_name}</h2>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${TIERS[selectedLead.tier || 'tier_1']?.badgeClass}`}>
                    Current: {TIERS[selectedLead.tier || 'tier_1']?.label}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-amber-500 mt-1">
                  Membership ID: {selectedLead.membership_id || 'DRAI-2026-PENDING'}
                </div>
              </div>
              <button onClick={closeLeadModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <SafeIcon icon={FiX} className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6 text-sm">
              <button
                type="button"
                onClick={() => setActiveModalTab('tier')}
                className={`pb-2.5 font-bold border-b-2 transition-colors ${
                  activeModalTab === 'tier'
                    ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Tier Management & Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('card')}
                className={`pb-2.5 font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeModalTab === 'card'
                    ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                <span>Virtual ID Card</span>
              </button>
            </div>

            {activeModalTab === 'card' ? (
              <div className="space-y-4">
                <div className="p-6 bg-slate-900 rounded-2xl flex flex-col items-center shadow-xl">
                  <MemberCard
                    lead={{
                      ...selectedLead,
                      photo_url_signed: photoUrl,
                      tier: targetTier
                    }}
                  />
                </div>
                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                  This preview renders the live card at current or staged tier ({TIERS[targetTier]?.label}).
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Member Details Snapshot */}
                <div className="flex flex-col sm:flex-row gap-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    {photoLoading ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : photoUrl ? (
                      <img src={photoUrl} alt={selectedLead.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <SafeIcon icon={selectedLead.photo_url ? FiCamera : FiUser} className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-500">Email:</span>
                      <p className="text-gray-900 dark:text-gray-200 font-medium">{selectedLead.email}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Phone:</span>
                      <p className="text-gray-900 dark:text-gray-200 font-medium">{selectedLead.phone || '—'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Source:</span>
                      <p className="text-gray-900 dark:text-gray-200 capitalize">{selectedLead.source || 'Website'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Joined:</span>
                      <p className="text-gray-900 dark:text-gray-200">
                        {new Date(selectedLead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Tier Stepper Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                    Select Member Tier Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TIER_KEYS.map((key) => {
                      const conf = TIERS[key];
                      const isSelected = targetTier === key;
                      const isCurrent = (selectedLead.tier || 'tier_1') === key;

                      return (
                        <div
                          key={key}
                          onClick={() => setTargetTier(key)}
                          className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 ring-2 ring-yellow-400/30'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                          }`}
                        >
                          {isCurrent && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              Current
                            </span>
                          )}
                          <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: conf.color }}
                            />
                            {conf.label}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{conf.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Email Notification Section */}
                {targetTier !== (selectedLead.tier || 'tier_1') && (
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendEmailNotification}
                          onChange={(e) => setSendEmailNotification(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                          Send automated notification email for promotion to {TIERS[targetTier]?.label}
                        </span>
                      </label>
                      <SafeIcon icon={FiMail} className="w-4 h-4 text-blue-600" />
                    </div>

                    {sendEmailNotification && (
                      <div>
                        <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                          Add Optional Custom Message to Email (Leadership Note):
                        </label>
                        <textarea
                          value={customEmailNote}
                          onChange={(e) => setCustomEmailNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. Thank you for your impressive contribution in the community session..."
                          className="w-full px-3 py-2 text-xs border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Internal Admin Notes
                  </label>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={4}
                    placeholder="Record engagement history, call outcomes, and reasons for promotion..."
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>

                {/* Alerts */}
                {tierActionSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-emerald-600" />
                    <span>{tierActionSuccess}</span>
                  </div>
                )}

                {tierActionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600" />
                    <span>{tierActionError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeLeadModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTier}
                    disabled={savingTier}
                    className="px-5 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 text-sm inline-flex items-center gap-2 shadow-sm"
                  >
                    {savingTier ? (
                      <span>Updating & Sending...</span>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} className="w-4 h-4" />
                        <span>Save & Apply Tier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Referral Member Creation Modal */}
      <AdminModal isOpen={showReferralForm} maxWidth="max-w-lg">
        <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Referral Member</h2>
          <button onClick={closeReferralForm} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleCreateReferral} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={referralForm.fullName}
              onChange={(e) => setReferralForm({ ...referralForm, fullName: e.target.value })}
              required
              placeholder="e.g. Tunde Adeyemi"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={referralForm.email}
                onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })}
                required
                placeholder="tunde@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={referralForm.phone}
                onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })}
                required
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Area of Interest</label>
              <select
                name="interest"
                value={referralForm.interest}
                onChange={(e) => setReferralForm({ ...referralForm, interest: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
              >
                <option value="Volunteering">Volunteering</option>
                <option value="Donating">Donating</option>
                <option value="Partnership">Partnership</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Initial Tier</label>
              <select
                name="tier"
                value={referralForm.tier}
                onChange={(e) => setReferralForm({ ...referralForm, tier: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
              >
                <option value="tier_1">Tier 1: Personal Advocate</option>
                <option value="tier_2">Tier 2: Movement Champion</option>
                <option value="tier_3">Tier 3: Strategic Leader</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Referred By (Referee Name) *</label>
            <input
              type="text"
              name="referredBy"
              value={referralForm.referredBy}
              onChange={(e) => setReferralForm({ ...referralForm, referredBy: e.target.value })}
              required
              placeholder="Name of referee who introduced this member"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Admin Notes (Optional)</label>
            <textarea
              name="adminNotes"
              value={referralForm.adminNotes}
              onChange={(e) => setReferralForm({ ...referralForm, adminNotes: e.target.value })}
              rows={3}
              placeholder="Additional background on the referral..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>

          {referralError && (
            <p className="text-red-600 text-xs">{referralError}</p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeReferralForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={referralSaving}
              className="px-5 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 text-sm"
            >
              {referralSaving ? 'Saving...' : 'Add Member'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Tier WhatsApp Communities Settings Modal */}
      <AdminModal isOpen={showWhatsAppModal} maxWidth="max-w-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <SafeIcon icon={FiMessageCircle} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Member Tier WhatsApp Communities
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configure the WhatsApp group invite links sent to members upon registration and promotion.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <SafeIcon icon={FiX} className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSaveWhatsApp} className="space-y-5">
            {/* Tier 1 WhatsApp Link */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Tier 1: Personal Advocate WhatsApp Group
                </label>
                {whatsAppLinks.tier_1 && (
                  <a
                    href={whatsAppLinks.tier_1}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Test Link</span>
                    <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={whatsAppLinks.tier_1 || ''}
                onChange={(e) =>
                  setWhatsAppLinks({ ...whatsAppLinks, tier_1: e.target.value })
                }
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 text-xs border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                Included in the official Tier 1 Welcome email sent to all new website & referral signups.
              </p>
            </div>

            {/* Tier 2 WhatsApp Link */}
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  Tier 2: Movement Champion WhatsApp Group
                </label>
                {whatsAppLinks.tier_2 && (
                  <a
                    href={whatsAppLinks.tier_2}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Test Link</span>
                    <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={whatsAppLinks.tier_2 || ''}
                onChange={(e) =>
                  setWhatsAppLinks({ ...whatsAppLinks, tier_2: e.target.value })
                }
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 text-xs border border-purple-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                Sent to members promoted to Tier 2 (Movement Champion) for public mobilization campaigns.
              </p>
            </div>

            {/* Tier 3 WhatsApp Link */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  Tier 3: Strategic Leader WhatsApp Group
                </label>
                {whatsAppLinks.tier_3 && (
                  <a
                    href={whatsAppLinks.tier_3}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Test Link</span>
                    <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={whatsAppLinks.tier_3 || ''}
                onChange={(e) =>
                  setWhatsAppLinks({ ...whatsAppLinks, tier_3: e.target.value })
                }
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 text-xs border border-emerald-200 dark:border-emerald-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                Sent to core leadership in Tier 3 driving strategy & sub-committee operations.
              </p>
            </div>

            {/* Alerts */}
            {whatsAppSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{whatsAppSuccess}</span>
              </div>
            )}

            {whatsAppError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{whatsAppError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={whatsAppSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 text-sm inline-flex items-center gap-2 shadow-sm"
              >
                {whatsAppSaving ? (
                  <span>Saving Links...</span>
                ) : (
                  <>
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
                    <span>Save WhatsApp Links</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminModal>
    </motion.div>
  );
};

export default LeadsManagement;
