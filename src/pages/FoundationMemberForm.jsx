import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import useSeo from '../hooks/useSeo';
import MemberCard from '../components/MemberCard';
import { submitFoundationLead, checkLeadDuplicate } from '../services/leadsService';

const {
  FiShield,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiArrowRight,
  FiCreditCard,
  FiExternalLink,
  FiX,
  FiCheck,
  FiLock,
  FiChevronRight
} = FiIcons;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

const FoundationMemberForm = () => {
  useSeo({
    title: 'Tier 4 Foundational Leader Onboarding | DoRight Initiative',
    description: 'Restricted governance tier onboarding portal for DoRight Awareness Initiative trustee-appointed leaders and founding advisors.',
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vision: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const [duplicateWarning, setDuplicateWarning] = useState({ field: null, message: '' });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (duplicateWarning.field === name) {
      setDuplicateWarning({ field: null, message: '' });
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleEmailBlur = async () => {
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return;
    try {
      const res = await checkLeadDuplicate({ email: cleanEmail });
      if (res?.isDuplicate && res?.duplicateField === 'email') {
        setDuplicateWarning({
          field: 'email',
          message: res.message || 'A member record with this email address is already registered.'
        });
      }
    } catch (e) {
      // non-blocking
    }
  };

  const handlePhoneBlur = async () => {
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 8) return;
    try {
      const res = await checkLeadDuplicate({ phone: cleanPhone });
      if (res?.isDuplicate && res?.duplicateField === 'phone') {
        setDuplicateWarning({
          field: 'phone',
          message: res.message || 'A member record with this phone number is already registered.'
        });
      }
    } catch (e) {
      // non-blocking
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please upload an image file in JPG, PNG, or WEBP format.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('The selected photo exceeds 5MB. Please choose a smaller portrait photo.');
      return;
    }

    setPhotoError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      try {
        URL.revokeObjectURL(photoPreview);
      } catch (e) {}
    }
    setPhotoPreview(null);
    setPhotoError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setSubmitError('Please enter your full name as you wish it to appear on your official membership card.');
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setSubmitError('Please provide a valid email address for board communications.');
      return;
    }

    if (!formData.phone.trim()) {
      setSubmitError('Please provide your direct contact phone number.');
      return;
    }

    if (!photoFile) {
      setPhotoError('A clear portrait photo is required for your official Tier 4 Membership Card.');
      return;
    }

    if (duplicateWarning.field && duplicateWarning.message) {
      setSubmitError(duplicateWarning.message);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await submitFoundationLead({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        vision: formData.vision.trim() || null,
        photoFile
      });

      const fallbackId = `DRAI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubmittedLead({
        full_name: formData.fullName.trim(),
        membership_id: created?.membership_id || fallbackId,
        tier: 'tier_4',
        tier_1_at: created?.tier_1_at || new Date().toISOString(),
        photo_preview: photoPreview,
        photo_url_signed: photoPreview,
        email: formData.email.trim().toLowerCase(),
      });
    } catch (err) {
      console.error('Error submitting Tier 4 registration:', err);
      const msg = err?.message || '';
      if (msg.includes('already registered') || err?.code === 'DUPLICATE_REGISTRATION') {
        setSubmitError('A registration record with this email or phone number already exists. If you have already registered, please contact admin@doright.ng to retrieve your card.');
      } else {
        setSubmitError('We could not complete your registration at this moment. Please check your internet connection or try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            to="/"
            className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <SafeIcon icon={FiShield} className="w-3.5 h-3.5" />
            <span>Restricted Governance Portal</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3 pt-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Welcome to the Board
          </h1>
          <p className="text-lg sm:text-xl font-bold text-amber-400">
            Tier 4 Foundational Leader Onboarding
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tier 4 is a restricted, non-transition governance tier reserved for trustee-appointed leaders,
            governance directors, and founding advisors guiding the long-term vision, strategy, and sustainability of the DRAI movement.
          </p>
        </div>

        {/* SUCCESS STATE */}
        <AnimatePresence mode="wait">
          {submittedLead ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Congratulatory Alert */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-2xl">
                <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 mx-auto">
                  <SafeIcon icon={FiCheckCircle} className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  Congratulations, {submittedLead.full_name}!
                </h2>
                <p className="text-sm text-slate-300 max-w-xl mx-auto">
                  Your Tier 4 Foundational Leader credentials have been issued. Your digital membership card is ready below.
                </p>
              </div>

              {/* Digital Membership Card Display */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-full flex justify-center">
                  <MemberCard lead={submittedLead} />
                </div>
                <p className="text-xs text-slate-400 italic">
                  Tip: Use the buttons on your card to download a high-resolution PNG or print your official credential.
                </p>
              </div>

              {/* Next Steps for Tier 4 Leaders */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <SafeIcon icon={FiAward} className="w-5 h-5 text-amber-400" />
                  <span>Next Steps as a Foundational Leader</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Membership Dues */}
                  <div className="p-4 bg-slate-950/70 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                      Pay your Annual Membership Dues
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you have not already done so, please make your payment. Membership dues for Tier 3 and Tier 4 members are set between <strong>NGN 250,000 - NGN 300,000</strong>. If you wish to pay more than the set amount, please feel free to do so. Payment reminders will begin during the final quarter of your current membership cycle.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/pay?purpose=registration&tier=tier_4&amount=250000"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                      >
                        <span>Access Payment Portal</span>
                        <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Governance Support */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <SafeIcon icon={FiBriefcase} className="w-4 h-4 text-blue-400" />
                      Board Secretary & Governance Desk
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If you have questions or require additional materials as you step into your governance role, please reach out directly:
                    </p>
                    <div className="text-xs text-slate-300 space-y-1 pt-1 font-mono">
                      <div>📧 <a href="mailto:admin@doright.ng" className="text-amber-400 underline">admin@doright.ng</a></div>
                      <div>📞 <a href="tel:+2348023298260" className="text-amber-400 underline">+234 802 329 8260</a></div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to={`/membership-card?id=${encodeURIComponent(submittedLead.membership_id)}`}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Open Permanent Card Page</span>
                    <SafeIcon icon={FiChevronRight} className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* FORM STATE */
            <motion.div
              key="onboarding-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Governance Scope Overview Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider text-xs">
                  Your Core Governance Scope
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <strong className="text-white block mb-0.5">High-Level Governance & Policy:</strong>
                      Define, guide, and maintain overall policy governance, scaling strategy, and organizational direction.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <strong className="text-white block mb-0.5">Financial Stewardship & Oversight:</strong>
                      Provide financial oversight and maintain long-term financial health to support DRAI programs and outreach.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <strong className="text-white block mb-0.5">Advisory & Executive Leadership:</strong>
                      Serve on the Advisory Council and the Keystone Executive Board to drive strategic decision-making.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <strong className="text-white block mb-0.5">Sustaining Movement Values:</strong>
                      Ensure organizational alignment and integrity across all advocacy tiers and initiatives nationwide.
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Form Card */}
              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">
                    Foundational Leader Registration & Membership Card Form
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Please provide your official information and portrait photo to issue your official DoRight Membership Card.
                  </p>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2.5">
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name * <span className="text-[11px] text-slate-500">(Printed on Membership Card)</span>
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Dr. Folake Adeleke"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Email Address * <span className="text-[11px] text-slate-500">(For Official Correspondence)</span>
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiMail} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleEmailBlur}
                          required
                          placeholder="folake@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      {duplicateWarning.field === 'email' && (
                        <p className="text-[11px] text-amber-400 font-medium">{duplicateWarning.message}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Phone Number * <span className="text-[11px] text-slate-500">(WhatsApp / Direct Line)</span>
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handlePhoneBlur}
                          required
                          placeholder="+234 802 329 8260"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      {duplicateWarning.field === 'phone' && (
                        <p className="text-[11px] text-amber-400 font-medium">{duplicateWarning.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PHOTO UPLOAD SECTION */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider">
                    Official Passport / Portrait Photo *
                  </label>
                  <p className="text-xs text-slate-400">
                    This photo will be framed with a gold accent on your official Tier 4 Membership Card. High resolution, clear portrait recommended (under 5MB).
                  </p>

                  {photoPreview ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950 border border-amber-500/40 rounded-xl">
                      <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-amber-400/80 shadow-md bg-slate-900 flex-shrink-0">
                        <img
                          src={photoPreview}
                          alt="Portrait Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="text-xs font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
                          <SafeIcon icon={FiCheck} className="w-4 h-4" />
                          <span>Photo successfully loaded</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {photoFile?.name} ({(photoFile?.size / 1024).toFixed(1)} KB)
                        </p>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <SafeIcon icon={FiX} className="w-3.5 h-3.5" />
                          <span>Change Photo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl cursor-pointer bg-slate-950/70 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition-colors">
                        <SafeIcon icon={FiUploadCloud} className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                        Click or drag portrait photo here
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        Supports JPG, PNG, or WEBP (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {photoError && (
                    <p className="text-xs text-red-400 font-medium flex items-center gap-1.5 pt-1">
                      <SafeIcon icon={FiAlertCircle} className="w-3.5 h-3.5" />
                      <span>{photoError}</span>
                    </p>
                  )}
                </div>

                {/* Vision / Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Governance Vision or Message for DRAI <span className="text-[11px] text-slate-500">(Optional)</span>
                  </label>
                  <textarea
                    name="vision"
                    value={formData.vision}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Share your strategic guidance, key priority areas, or note to the Executive Directorate..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <SafeIcon icon={FiLock} className="w-3.5 h-3.5 text-amber-500" />
                    <span>Confidential governance registry • Encrypted submission</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Issuing Membership Card...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Onboarding &amp; Issue Card</span>
                        <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FoundationMemberForm;
