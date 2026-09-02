import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import AdminModal from '../../components/admin/AdminModal';
import * as FiIcons from 'react-icons/fi';
import MemberCard from '../../components/MemberCard';
import MemberAvatar from '../../common/MemberAvatar';
import supabase from '../../lib/supabase';
import {
  TIERS,
  TIER_KEYS,
  getActiveSubCommittees,
  updateLeadTier,
  deleteLead,
  updateLeadImpactSubmission,
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
  FiExternalLink,
  FiTrash2,
  FiFilter,
  FiCalendar,
  FiCheck,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw
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

const MONTH_NAMES = [
  { key: '01', name: 'January', short: 'Jan' },
  { key: '02', name: 'February', short: 'Feb' },
  { key: '03', name: 'March', short: 'Mar' },
  { key: '04', name: 'April', short: 'Apr' },
  { key: '05', name: 'May', short: 'May' },
  { key: '06', name: 'June', short: 'Jun' },
  { key: '07', name: 'July', short: 'Jul' },
  { key: '08', name: 'August', short: 'Aug' },
  { key: '09', name: 'September', short: 'Sep' },
  { key: '10', name: 'October', short: 'Oct' },
  { key: '11', name: 'November', short: 'Nov' },
  { key: '12', name: 'December', short: 'Dec' }
];

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierTab, setSelectedTierTab] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all'); // 'all' | 'submitted_current' | 'pending_current'
  const [subCommitteeFilter, setSubCommitteeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name_asc' | 'name_desc'

  // Selected Lead for Tier Management Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('tier'); // 'tier' | 'impact' | 'card'
  const [targetTier, setTargetTier] = useState('tier_1');
  const [noteDraft, setNoteDraft] = useState('');
  const [customEmailNote, setCustomEmailNote] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [savingTier, setSavingTier] = useState(false);
  const [tierActionSuccess, setTierActionSuccess] = useState('');
  const [tierActionError, setTierActionError] = useState('');

  // Monthly Impact Stories Modal State
  const currentYear = new Date().getFullYear();
  const currentMonthNumber = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentMonthKey = `${currentYear}-${currentMonthNumber}`;
  const currentMonthObj = MONTH_NAMES.find((m) => m.key === currentMonthNumber) || MONTH_NAMES[7];

  const [selectedImpactYear, setSelectedImpactYear] = useState(currentYear);
  const [impactSubmissionsDraft, setImpactSubmissionsDraft] = useState({});
  const [savingImpactMonth, setSavingImpactMonth] = useState(null);
  const [impactToast, setImpactToast] = useState('');

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

  // Delete Member Confirmation
  const [deletingLead, setDeletingLead] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccessToast, setDeleteSuccessToast] = useState('');

  // Sub-committees
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

      // Normalise tier and impact_submissions
      const normalised = (data || []).map((item) => ({
        ...item,
        tier: item.tier || 'tier_1',
        impact_submissions: item.impact_submissions || {}
      }));

      // Batch pre-generate signed URLs for member photos stored in storage
      const photoPaths = normalised
        .filter((l) => l.photo_url && !l.photo_url.startsWith('http') && !l.photo_url.startsWith('data:'))
        .map((l) => l.photo_url);

      if (photoPaths.length > 0) {
        try {
          const { data: signedData, error: signedError } = await supabase.storage
            .from('lead-photos')
            .createSignedUrls(photoPaths, 3600);

          if (!signedError && signedData) {
            const urlMap = {};
            signedData.forEach((item) => {
              if (item.path && item.signedUrl) {
                urlMap[item.path] = item.signedUrl;
              }
            });
            normalised.forEach((lead) => {
              if (lead.photo_url) {
                lead.photo_url_signed = urlMap[lead.photo_url] || (lead.photo_url.startsWith('http') ? lead.photo_url : null);
              }
            });
          }
        } catch (storageErr) {
          console.warn('Batch signed URL generation warning:', storageErr);
        }
      }

      setLeads(normalised);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteLead(deletingLead.id);

      const removedName = deletingLead.full_name || 'Member';
      setLeads((prev) => prev.filter((l) => l.id !== deletingLead.id));

      if (selectedLead?.id === deletingLead.id) {
        closeLeadModal();
      }
      setDeletingLead(null);
      setDeleteSuccessToast(`Member "${removedName}" was successfully removed.`);
      setTimeout(() => setDeleteSuccessToast(''), 4500);
    } catch (err) {
      console.error('Error removing member:', err);
      setDeleteError('Unable to remove this member right now. Please verify your administrator permissions and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Tier counts
  const counts = useMemo(() => {
    return {
      all: leads.length,
      tier_1: leads.filter((l) => (l.tier || 'tier_1') === 'tier_1').length,
      tier_2: leads.filter((l) => l.tier === 'tier_2').length,
      tier_3: leads.filter((l) => l.tier === 'tier_3').length,
      submittedCurrentMonth: leads.filter((l) => l.impact_submissions?.[currentMonthKey] === true).length
    };
  }, [leads, currentMonthKey]);

  // Filtered and Sorted leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const currentTier = lead.tier || 'tier_1';
        if (selectedTierTab !== 'all' && currentTier !== selectedTierTab) {
          return false;
        }

        // Sub-Committee Filter
        if (subCommitteeFilter !== 'all') {
          if (subCommitteeFilter === 'none' && lead.sub_committee_id) return false;
          if (subCommitteeFilter !== 'none' && lead.sub_committee_id !== subCommitteeFilter) return false;
        }

        // Impact Story Filter
        if (impactFilter === 'submitted_current') {
          if (lead.impact_submissions?.[currentMonthKey] !== true) return false;
        } else if (impactFilter === 'pending_current') {
          if (lead.impact_submissions?.[currentMonthKey] === true) return false;
        }

        // Search Term
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          const matchName = lead.full_name?.toLowerCase().includes(term);
          const matchEmail = lead.email?.toLowerCase().includes(term);
          const matchPhone = lead.phone?.toLowerCase().includes(term);
          const matchMemId = lead.membership_id?.toLowerCase().includes(term);
          const matchNotes = lead.admin_notes?.toLowerCase().includes(term);
          const matchRef = lead.referred_by?.toLowerCase().includes(term);
          return matchName || matchEmail || matchPhone || matchMemId || matchNotes || matchRef;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
        if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
        return 0;
      });
  }, [leads, selectedTierTab, subCommitteeFilter, impactFilter, searchTerm, sortBy, currentMonthKey]);

  const hasActiveFilters =
    selectedTierTab !== 'all' ||
    impactFilter !== 'all' ||
    subCommitteeFilter !== 'all' ||
    searchTerm.trim() !== '' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSelectedTierTab('all');
    setImpactFilter('all');
    setSubCommitteeFilter('all');
    setSearchTerm('');
    setSortBy('newest');
  };

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
    setImpactToast('');
    setImpactSubmissionsDraft(lead.impact_submissions || {});
    setSelectedImpactYear(currentYear);
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
    setImpactToast('');
  };

  // Toggle Impact Story Submission for a Month
  const handleToggleImpactMonth = async (monthKey, isSubmitted) => {
    if (!selectedLead) return;

    setSavingImpactMonth(monthKey);
    setImpactToast('');

    try {
      const updatedMap = {
        ...impactSubmissionsDraft,
        [monthKey]: isSubmitted
      };
      setImpactSubmissionsDraft(updatedMap);

      await updateLeadImpactSubmission(selectedLead.id, monthKey, isSubmitted);

      // Update in leads list
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, impact_submissions: updatedMap }
            : l
        )
      );

      // Update selected lead state
      setSelectedLead((prev) => ({
        ...prev,
        impact_submissions: updatedMap
      }));

      const monthName = MONTH_NAMES.find((m) => m.key === monthKey.split('-')[1])?.name || monthKey;
      setImpactToast(`Updated ${monthName} submission status to: ${isSubmitted ? 'Submitted (Yes)' : 'Not Submitted (No)'}`);
      setTimeout(() => setImpactToast(''), 3500);
    } catch (err) {
      console.error('Error updating impact story submission:', err);
      alert('Unable to save impact submission. Please verify your connection and try again.');
    } finally {
      setSavingImpactMonth(null);
    }
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
      setTierActionError('Unable to update member tier. Please verify your administrator session and try again.');
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
      await updateLeadTier({
        lead,
        newTier: nextTier,
        adminNotes: `[Promoted to ${TIERS[nextTier]?.label || nextTier} on ${new Date().toLocaleDateString('en-GB')}]`,
        sendEmail: true
      });
      await fetchLeads();
    } catch (err) {
      console.error('Quick advance error:', err);
      alert('Unable to promote member. Please verify your administrator permissions and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Referral Handlers
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
    if (!referralForm.fullName.trim() || !referralForm.email.trim()) {
      setReferralError('Please provide both the full name and email address.');
      return;
    }

    try {
      setReferralSaving(true);
      setReferralError('');

      const now = new Date().toISOString();
      const { error } = await supabase.from('leads').insert({
        full_name: referralForm.fullName.trim(),
        email: referralForm.email.trim().toLowerCase(),
        phone: referralForm.phone.trim() || null,
        tier: referralForm.tier || 'tier_1',
        tier_1_at: now,
        referred_by: referralForm.referredBy.trim() || null,
        source: 'referral',
        impact_submissions: {},
        admin_notes: referralForm.adminNotes ? `Interest: ${referralForm.interest}\n${referralForm.adminNotes}` : `Interest: ${referralForm.interest}`
      });

      if (error) throw error;

      closeReferralForm();
      fetchLeads();
    } catch (error) {
      console.error('Error creating referral:', error);
      setReferralError('Unable to save referral member. Please verify the email address is not already registered.');
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
      setWhatsAppError('Unable to update WhatsApp group links right now. Please check your network connection.');
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
            <span>Members &amp; Tier Management</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track user form submissions, verify monthly impact stories, promote members across tiers, and manage community communications.
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

      {/* Success Notification Banner */}
      <AnimatePresence>
        {deleteSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{deleteSuccessToast}</span>
            </div>
            <button
              onClick={() => setDeleteSuccessToast('')}
              className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier & Monthly Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* All Members */}
        <div
          onClick={() => setSelectedTierTab('all')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            selectedTierTab === 'all'
              ? 'bg-white dark:bg-gray-800 border-yellow-400 ring-2 ring-yellow-400/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Members</span>
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <SafeIcon icon={FiLayers} className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-2">{counts.all}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Total registered leads</div>
        </div>

        {/* Tier 1 */}
        <div
          onClick={() => setSelectedTierTab('tier_1')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            selectedTierTab === 'tier_1'
              ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Tier 1: Advocates
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <SafeIcon icon={FiAward} className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_1}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Personal advocates</div>
        </div>

        {/* Tier 2 */}
        <div
          onClick={() => setSelectedTierTab('tier_2')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            selectedTierTab === 'tier_2'
              ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Tier 2: Champions
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <SafeIcon icon={FiTrendingUp} className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_2}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">Outreach &amp; mobilizers</div>
        </div>

        {/* Tier 3 */}
        <div
          onClick={() => setSelectedTierTab('tier_3')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            selectedTierTab === 'tier_3'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Tier 3: Leaders
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <SafeIcon icon={FiAward} className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-2">{counts.tier_3}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Strategic &amp; committee leaders</div>
        </div>

        {/* Monthly Impact Story Tracker Card */}
        <div
          onClick={() => setImpactFilter(impactFilter === 'submitted_current' ? 'all' : 'submitted_current')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            impactFilter === 'submitted_current'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {currentMonthObj.short} Impact Stories
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <SafeIcon icon={FiBookOpen} className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {counts.submittedCurrentMonth} <span className="text-xs font-normal text-gray-400">/ {counts.all}</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
            Submitted for {currentMonthObj.name}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tier Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-lg">
              <button
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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
            <div className="relative w-full lg:w-96">
              <SafeIcon icon={FiSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, phone, Membership ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filters: Impact Status, Sub-Committee & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-gray-100 dark:border-gray-700/60">
            <div className="flex flex-wrap items-center gap-3">
              {/* Monthly Story Filter */}
              <div className="flex items-center gap-1.5">
                <SafeIcon icon={FiBookOpen} className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-gray-500">Impact Story:</span>
                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 font-medium"
                >
                  <option value="all">All Submission Statuses</option>
                  <option value="submitted_current">Submitted for {currentMonthObj.name} (Yes)</option>
                  <option value="pending_current">Pending for {currentMonthObj.name} (No)</option>
                </select>
              </div>

              {/* Sub-Committee Filter */}
              {subCommittees.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <SafeIcon icon={FiFilter} className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-gray-500">Sub-Committee:</span>
                  <select
                    value={subCommitteeFilter}
                    onChange={(e) => setSubCommitteeFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 font-medium"
                  >
                    <option value="all">All Sub-Committees</option>
                    <option value="none">No Sub-Committee Assigned</option>
                    {subCommittees.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <SafeIcon icon={FiClock} className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 font-medium"
                >
                  <option value="newest">Newest Registered</option>
                  <option value="oldest">Oldest Registered</option>
                  <option value="name_asc">Name (A ➔ Z)</option>
                  <option value="name_desc">Name (Z ➔ A)</option>
                </select>
              </div>
            </div>

            {/* Reset Filters & Count Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs font-medium">
                Showing <strong className="text-gray-900 dark:text-white">{filteredLeads.length}</strong> of {leads.length} members
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2.5 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading members...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No members found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-3 py-1.5 bg-yellow-400 text-black font-semibold text-xs rounded-lg hover:bg-yellow-500"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Member / Advocate</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Current Tier</th>
                  <th className="p-4 text-center">
                    {currentMonthObj.short} Story
                  </th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Tier Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => {
                  const currentTier = lead.tier || 'tier_1';
                  const tierConfig = TIERS[currentTier] || TIERS.tier_1;
                  const isSubmittedThisMonth = lead.impact_submissions?.[currentMonthKey] === true;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openLeadModal(lead, 'tier')}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar
                            lead={lead}
                            size="md"
                            className="ring-2 ring-gray-100 dark:ring-gray-700"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{lead.full_name}</span>
                            </div>
                            <div className="text-[11px] font-mono text-amber-500 font-bold">
                              {lead.membership_id || 'ID Pending'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="space-y-0.5">
                          <div className="font-medium text-gray-900 dark:text-gray-200">{lead.email}</div>
                          <div className="text-gray-500">{lead.phone || 'No phone'}</div>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tierConfig.badgeClass}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: tierConfig.color }}
                          />
                          <span>{tierConfig.label}</span>
                        </span>
                      </td>

                      {/* Monthly Impact Story Badge (Quick Action to Impact Tab) */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLeadModal(lead, 'impact');
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                            isSubmittedThisMonth
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                          title={`Click to view/update monthly impact story submissions for ${lead.full_name}`}
                        >
                          {isSubmittedThisMonth ? (
                            <>
                              <SafeIcon icon={FiCheck} className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>Yes</span>
                            </>
                          ) : (
                            <>
                              <SafeIcon icon={FiX} className="w-3 h-3 text-gray-400 stroke-[2.5]" />
                              <span>No</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Registered Date */}
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Tier Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {currentTier === 'tier_1' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdvance(e, lead, 'tier_2')}
                              className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold rounded-md transition-colors"
                              title="Promote to Tier 2 (Movement Champion)"
                            >
                              ➔ Tier 2
                            </button>
                          )}
                          {currentTier === 'tier_2' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdvance(e, lead, 'tier_3')}
                              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-md transition-colors"
                              title="Promote to Tier 3 (Strategic Leader)"
                            >
                              ➔ Tier 3
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openLeadModal(lead, 'tier')}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-md transition-colors"
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

      {/* INDIVIDUAL LEAD / MEMBER MODAL */}
      <AdminModal isOpen={!!selectedLead} maxWidth="max-w-2xl">
        {selectedLead && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-3.5">
                <MemberAvatar
                  lead={selectedLead}
                  src={photoUrl || selectedLead.photo_url_signed}
                  size="lg"
                  className="ring-2 ring-yellow-400/60 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.full_name}</h2>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${TIERS[selectedLead.tier || 'tier_1']?.badgeClass}`}>
                      {TIERS[selectedLead.tier || 'tier_1']?.label}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                    Membership ID: {selectedLead.membership_id || 'DRAI-2026-PENDING'}
                  </div>
                </div>
              </div>
              <button onClick={closeLeadModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <SafeIcon icon={FiX} className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Tab Navigation: Tier Management | Monthly Impact Stories | Virtual ID Card */}
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
                Tier Management &amp; Notes
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('impact')}
                className={`pb-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeModalTab === 'impact'
                    ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
                <span>Monthly Impact Stories</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('card')}
                className={`pb-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeModalTab === 'card'
                    ? 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                <span>Virtual ID Card</span>
              </button>
            </div>

            {/* TAB 1: MONTHLY IMPACT STORIES TRACKER */}
            {activeModalTab === 'impact' ? (
              <div className="space-y-6">
                {/* Information Banner */}
                <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <SafeIcon icon={FiBookOpen} className="w-4 h-4 text-amber-600" />
                    <span>Monthly Impact Story Verification</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                    Members are expected to submit impact stories every month on the official WhatsApp community group. Use this dashboard to record whether <strong>{selectedLead.full_name}</strong> has submitted for each month.
                  </p>
                </div>

                {/* Year Navigation Bar */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => setSelectedImpactYear((y) => y - 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <SafeIcon icon={FiChevronLeft} className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Year {selectedImpactYear}
                    </span>
                    {selectedImpactYear === currentYear && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 text-[10px] font-bold rounded">
                        Current Year
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedImpactYear((y) => y + 1)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                  </button>
                </div>

                {/* Toast message */}
                {impactToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{impactToast}</span>
                  </div>
                )}

                {/* 12 Months Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {MONTH_NAMES.map((m) => {
                    const monthKey = `${selectedImpactYear}-${m.key}`;
                    const isSubmitted = impactSubmissionsDraft[monthKey] === true;
                    const isCurrent = monthKey === currentMonthKey;
                    const isSavingThis = savingImpactMonth === monthKey;

                    return (
                      <div
                        key={monthKey}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {m.name} {selectedImpactYear}
                            </span>
                            {isCurrent && (
                              <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded">
                                This Month
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                              isSubmitted
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {isSubmitted ? 'Submitted ✅' : 'Pending ❌'}
                          </span>
                        </div>

                        {/* Yes / No Toggle Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isSavingThis}
                            onClick={() => handleToggleImpactMonth(monthKey, true)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isSubmitted
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                                : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <SafeIcon icon={FiCheck} className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Yes</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSavingThis}
                            onClick={() => handleToggleImpactMonth(monthKey, false)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              !isSubmitted
                                ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-500/30'
                                : 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <SafeIcon icon={FiX} className="w-3.5 h-3.5 stroke-[3]" />
                            <span>No</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  Clicking <strong>Yes</strong> or <strong>No</strong> instantly updates and saves the submission record.
                </div>
              </div>
            ) : activeModalTab === 'card' ? (
              /* TAB 2: VIRTUAL ID CARD */
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
              /* TAB 3: TIER MANAGEMENT & NOTES */
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingLead(selectedLead);
                      setDeleteError('');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 transition-colors inline-flex items-center justify-center gap-1.5 border border-red-200/50 dark:border-red-900/40"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    <span>Remove Member</span>
                  </button>
                  <div className="flex justify-end gap-3">
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
                        <span>Updating &amp; Sending...</span>
                      ) : (
                        <>
                          <SafeIcon icon={FiSend} className="w-4 h-4" />
                          <span>Save &amp; Apply Tier</span>
                        </>
                      )}
                    </button>
                  </div>
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
                placeholder="+234 912 339 9968"
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
            <label className="block text-xs font-semibold mb-1">Admin Notes</label>
            <textarea
              name="adminNotes"
              value={referralForm.adminNotes}
              onChange={(e) => setReferralForm({ ...referralForm, adminNotes: e.target.value })}
              rows={3}
              placeholder="Additional background notes about this referral..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-sm"
            />
          </div>

          {referralError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
              {referralError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeReferralForm}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={referralSaving}
              className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50 text-sm"
            >
              {referralSaving ? 'Saving...' : 'Add Member'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* WhatsApp Communities Settings Modal */}
      <AdminModal isOpen={showWhatsAppModal} maxWidth="max-w-xl">
        <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <SafeIcon icon={FiMessageCircle} className="h-5 w-5 text-emerald-600" />
              <span>Tier WhatsApp Group Links</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure official community invite links included in automated onboarding &amp; tier upgrade emails.
            </p>
          </div>
          <button onClick={() => setShowWhatsAppModal(false)} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSaveWhatsApp} className="space-y-4 text-sm">
          {TIER_KEYS.map((key) => {
            const conf = TIERS[key];
            return (
              <div key={key} className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: conf.color }} />
                  <span>{conf.label} WhatsApp Invite Link</span>
                </label>
                <input
                  type="url"
                  value={whatsAppLinks[key] || ''}
                  onChange={(e) => setWhatsAppLinks({ ...whatsAppLinks, [key]: e.target.value })}
                  placeholder={`https://chat.whatsapp.com/...`}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 text-xs font-mono bg-white dark:bg-gray-800"
                />
              </div>
            );
          })}

          {whatsAppSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-emerald-600" />
              <span>{whatsAppSuccess}</span>
            </div>
          )}

          {whatsAppError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs">
              {whatsAppError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(false)}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={whatsAppSaving}
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm"
            >
              {whatsAppSaving ? 'Saving...' : 'Save Group Links'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Member Confirmation Modal */}
      <AdminModal isOpen={!!deletingLead} maxWidth="max-w-md">
        {deletingLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <MemberAvatar
                lead={deletingLead}
                size="md"
                className="ring-2 ring-red-200 dark:ring-red-900"
              />
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Remove Member
                </h3>
                <p className="text-xs text-gray-500">Irreversible administrative action</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-gray-900 dark:text-white">{deletingLead.full_name}</strong> ({deletingLead.email})?
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm inline-flex items-center gap-1.5"
              >
                {isDeleting ? <span>Removing...</span> : <span>Confirm &amp; Remove</span>}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </motion.div>
  );
};

export default LeadsManagement;
