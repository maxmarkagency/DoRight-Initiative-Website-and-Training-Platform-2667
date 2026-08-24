import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { FaHandshake, FaWhatsapp } from 'react-icons/fa6';
import { submitLead } from '../services/leadsService';
import MemberCard from '../components/MemberCard';
import supabase from '../lib/supabase';
import useSeo from '../hooks/useSeo';

const {
  FiUsers,
  FiHeart,
  FiCheck,
  FiArrowRight,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAlertCircle,
  FiX,
  FiUploadCloud,
  FiCheckCircle
} = FiIcons;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const INTEREST_OPTIONS = ['Volunteering', 'Donating', 'Partnership'];

const Join = () => {
  useSeo({
    path: '/join',
    title: 'Join The Movement',
    description: 'Get involved with DoRight Awareness Initiative — volunteer, donate, or partner with us to help build a more accountable Nigeria.',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Volunteering',
    message: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [siteSettings, setSiteSettings] = useState({});
  const waysSectionRef = useRef(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['contact_email', 'contact_phone', 'contact_address'])
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading contact settings:', error);
          return;
        }
        const settings = {};
        (data || []).forEach((row) => {
          settings[row.setting_key] = row.setting_value;
        });
        setSiteSettings(settings);
      });
  }, []);

  // Lock background scroll when modal is open & handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const openModal = (initialInterest = 'Volunteering') => {
    setFormData((prev) => ({
      ...prev,
      interest: INTEREST_OPTIONS.includes(initialInterest) ? initialInterest : 'Volunteering'
    }));
    setIsSubmitted(false);
    setSubmitError('');
    setPhotoError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // If submitted, reset the form for a clean next open
    if (isSubmitted) {
      setFormData({ name: '', email: '', phone: '', interest: 'Volunteering', message: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsSubmitted(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a photo in JPG, PNG, or WEBP format.');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('The selected photo is too large (over 5MB). Please choose a smaller image.');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const scrollToWays = () => {
    waysSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getFriendlySubmitError = (error) => {
    if (!error) return 'Unable to submit your application right now. Please check your internet connection and try again.';
    const msg = typeof error === 'string' ? error : error?.message || '';
    if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists') || msg.includes('23505')) {
      return 'An advocate with this email address is already registered. If you are already a member or need support, please contact info@doright.ng.';
    }
    if (msg.includes('network') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network error')) {
      return 'Could not reach the server. Please check your internet connection and try again.';
    }
    if (msg.includes('email') || msg.includes('format')) {
      return 'Please double-check your email address to ensure it is entered correctly.';
    }
    return 'We were unable to process your application right now. Please try again in a few moments or email us at info@doright.ng.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim().length < 2) {
      setSubmitError('Please enter your full name as you would like it to appear on your membership card.');
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setSubmitError('Please provide a valid email address so we can send your digital membership card.');
      return;
    }

    if (!photoFile) {
      setPhotoError('Please upload a clear passport or portrait photo for your official membership card.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const createdLead = await submitLead({
        fullName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || '',
        interest: formData.interest,
        message: formData.message,
        photoFile
      });
      setSubmittedLead({
        full_name: formData.name.trim(),
        membership_id: createdLead?.membership_id || `DRAI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        tier: 'tier_1',
        photo_preview: photoPreview
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      setSubmitError(getFriendlySubmitError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const ways = [
    {
      title: 'Volunteer',
      interestKey: 'Volunteering',
      description: 'Join our community of dedicated volunteers working on the ground to promote integrity and accountability.',
      features: [
        'Community outreach programs',
        'Event organization support',
        'Training and mentorship',
        'Flexible time commitment',
        'Skills development opportunities'
      ],
      icon: FiUsers,
      color: 'bg-primary',
      ctaText: 'Become a Volunteer'
    },
    {
      title: 'Donate',
      interestKey: 'Donating',
      description: 'Support our mission with financial contributions that help us expand our reach and impact across Nigeria.',
      features: [
        'Monthly or one-time donations',
        'Transparent fund allocation',
        'Regular impact reports',
        'Tax-deductible receipts',
        'Direct community impact'
      ],
      icon: FiHeart,
      color: 'bg-accent',
      ctaText: 'Make a Donation'
    },
    {
      title: 'Partner',
      interestKey: 'Partnership',
      description: 'Collaborate with us as an organization, institution, or business to amplify our collective impact.',
      features: [
        'Strategic partnerships',
        'Joint program development',
        'Resource sharing',
        'Co-branded initiatives',
        'Network expansion'
      ],
      icon: FaHandshake,
      color: 'bg-primary',
      ctaText: 'Partner With Us'
    }
  ];

  const stats = [
    { number: '500+', label: 'Active Volunteers' },
    { number: '₦50M+', label: 'Funds Raised' },
    { number: '25+', label: 'Partner Organizations' },
    { number: '100+', label: 'Communities Impacted' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight">Join the Movement</h1>
            <p className="text-xl text-neutral-300 leading-relaxed mb-8">
              Become part of a growing community of Nigerians committed to building a more transparent, accountable, and integrity-driven society. Together, we can create lasting change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openModal('Volunteering')}
                className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center text-lg"
              >
                Apply to Join
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={scrollToWays}
                className="border-2 border-white/80 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all inline-flex items-center justify-center text-lg"
              >
                Explore Opportunities
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ways to Join */}
      <section ref={waysSectionRef} className="py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">Ways to Get Involved</h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Choose how you'd like to contribute to building a better Nigeria. Every form of support makes a meaningful difference.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ways.map((way, index) => (
              <motion.div
                key={way.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`p-6 ${way.color}`}>
                    <SafeIcon
                      icon={way.icon}
                      className={`w-12 h-12 ${way.title === 'Donate' ? 'text-neutral-900' : 'text-white'} mb-4`}
                    />
                    <h3
                      className={`text-h3 font-heading font-bold ${way.title === 'Donate' ? 'text-neutral-900' : 'text-white'} mb-2`}
                    >
                      {way.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-neutral-700 mb-6 leading-relaxed">{way.description}</p>
                    <div className="space-y-3 mb-8">
                      {way.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-neutral-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    onClick={() => openModal(way.interestKey)}
                    className={`w-full ${way.title === 'Donate' ? 'bg-accent text-neutral-900 hover:brightness-90' : 'bg-primary text-white hover:bg-primary-600'} px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center`}
                  >
                    {way.ctaText}
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information & Support */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          <div className="bg-neutral-50 rounded-2xl p-8 sm:p-12 border border-neutral-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                  Have Questions?
                </span>
                <h3 className="text-h2 font-heading font-bold text-neutral-900 mb-4">
                  Connect With Our Team
                </h3>
                <p className="text-neutral-700 text-lg mb-6 leading-relaxed">
                  Want to learn more before applying or need assistance with your application? Reach out to us directly or visit our office.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <SafeIcon icon={FiMail} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-0.5">Email Us</h4>
                      <p className="text-neutral-700 text-sm">{siteSettings.contact_email || 'info@doright.ng'}</p>
                      <p className="text-neutral-700 text-sm">volunteer@doright.ng</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <SafeIcon icon={FiPhone} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-0.5">Call Us</h4>
                      <p className="text-neutral-700 text-sm">
                        <a href={`tel:${(siteSettings.contact_phone || '+234 912 339 9968').replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                          {siteSettings.contact_phone || '+234 912 339 9968'}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start sm:col-span-2">
                    <SafeIcon icon={FiMapPin} className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-0.5">Visit Us</h4>
                      <p className="text-neutral-700 text-sm">
                        {siteSettings.contact_address || '28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria 101233'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <SafeIcon icon={FiUsers} className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-heading font-bold text-neutral-900 mb-2">Ready to Make an Impact?</h4>
                <p className="text-neutral-600 text-sm mb-6">
                  Fill out our brief form and our team will get back to you promptly.
                </p>
                <button
                  onClick={() => openModal('Volunteering')}
                  className="w-full bg-primary text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  Open Application Form
                  <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">Our Growing Impact</h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              See how our community is making a difference across Nigeria
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-neutral-700 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h2 font-heading font-bold mb-6">Every Action Counts</h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Whether you volunteer an hour a week, partner with us, or donate monthly, your contribution helps build a Nigeria where integrity thrives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openModal('Volunteering')}
                className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center"
              >
                Start Volunteering
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </button>
              <Link
                to="/pay"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"
              >
                Sponsor / Make a Payment
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pop-up Application Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden p-2.5 xs:p-4 sm:p-6 flex min-h-full items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm"
              onClick={closeModal}
              aria-hidden="true"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col z-10 border border-neutral-100 overflow-hidden my-auto"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 sm:px-6 sm:py-4 md:px-8 md:py-5 border-b border-neutral-100 flex items-center justify-between z-20 flex-shrink-0">
                <div className="pr-2 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-neutral-900 tracking-tight">
                    {isSubmitted ? 'Official Membership Ready' : 'Join the Movement'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 leading-snug">
                    {isSubmitted ? 'Your virtual member card and details are confirmed.' : 'Fill out the form below to get started with DoRight Initiative.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 -mr-1.5 sm:mr-0 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0 active:scale-95"
                  aria-label="Close dialog"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-4 sm:p-6 md:p-8 overscroll-contain">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-2 sm:py-4 space-y-4 sm:space-y-6"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <SafeIcon icon={FiCheckCircle} className="w-6 h-6 sm:w-9 sm:h-9" />
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl font-bold text-neutral-900">
                        {formData.interest === 'Donating'
                          ? 'Thank You for Supporting DoRight!'
                          : formData.interest === 'Partnership'
                          ? 'Thank You for Your Partnership Interest!'
                          : 'Welcome to DoRight Initiative!'}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mt-1 leading-relaxed">
                        {formData.interest === 'Donating'
                          ? 'Our official GTBank banking details and confirmation instructions have been sent to your email.'
                          : formData.interest === 'Partnership'
                          ? 'Our collaboration opportunities and next steps have been sent to your email.'
                          : (
                            <>
                              Your registration has been activated in <strong>Tier 1 (Personal Advocate)</strong>. Your official <strong>Advocate Card</strong> is ready below:
                            </>
                          )}
                      </p>
                    </div>

                    {/* Member Card Component Container */}
                    <div className="p-2 xs:p-3 sm:p-6 bg-slate-900 rounded-2xl flex flex-col items-center shadow-xl w-full overflow-hidden">
                      <MemberCard lead={submittedLead} />
                    </div>

                    <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                      A confirmation email containing your Advocate ID (<strong>{submittedLead?.membership_id}</strong>) and details has also been sent to <strong>{formData.email}</strong>.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                      {formData.interest === 'Donating' ? (
                        <Link
                          to="/pay?purpose=donation"
                          onClick={closeModal}
                          className="w-full sm:w-auto flex-1 min-w-[200px] bg-accent hover:brightness-90 text-neutral-900 px-6 py-3 rounded-xl font-bold transition-all shadow-md text-sm inline-flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span>Proceed to Payment Portal</span>
                          <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                        </Link>
                      ) : (
                        <a
                          href="https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex-1 min-w-[200px] bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md text-sm inline-flex items-center justify-center gap-2 active:scale-95"
                        >
                          <SafeIcon icon={FaWhatsapp} className="w-5 h-5 text-white" />
                          <span>Join Tier 1 WhatsApp</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={closeModal}
                        className="w-full sm:w-auto min-w-[120px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-6 py-3 rounded-xl font-bold transition-all text-sm active:scale-95"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Area of Interest */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-2">
                        Area of Interest <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                        {INTEREST_OPTIONS.map((option) => {
                          const isSelected = formData.interest === option;
                          const IconComponent = option === 'Volunteering' ? FiUsers : option === 'Donating' ? FiHeart : FaHandshake;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setFormData({ ...formData, interest: option })}
                              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center sm:justify-center justify-between gap-2.5 ${
                                isSelected
                                  ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20'
                                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <SafeIcon icon={IconComponent} className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                                <span className="truncate">{option}</span>
                              </div>
                              {isSelected && (
                                <SafeIcon icon={FiCheck} className="w-4 h-4 text-white sm:hidden flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Direct Pay Prompt if Donating is selected */}
                      {formData.interest === 'Donating' && (
                        <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
                          <span>Want to pay instantly online or via direct GTBank transfer?</span>
                          <Link
                            to="/pay?purpose=donation"
                            onClick={closeModal}
                            className="bg-primary text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors whitespace-nowrap"
                          >
                            Go to Payment Page →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label htmlFor="modal-name" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="modal-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Amina Bello"
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-neutral-300 rounded-xl text-neutral-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-neutral-400 transition-all"
                      />
                    </div>

                    {/* Email & Phone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label htmlFor="modal-email" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="modal-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="amina@example.com"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-neutral-300 rounded-xl text-neutral-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-neutral-400 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-phone" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="modal-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="+234 912 339 9968"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-neutral-300 rounded-xl text-neutral-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-neutral-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="modal-message" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1 sm:mb-1.5">
                        Message <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        id="modal-message"
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us a little about your background or how you would like to collaborate..."
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-neutral-300 rounded-xl text-neutral-900 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-neutral-400 resize-none transition-all"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 sm:gap-2 mb-1.5">
                        <label className="block text-xs sm:text-sm font-semibold text-neutral-800">
                          Your Photo / Passport <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] sm:text-xs text-neutral-500">JPG, PNG, WEBP &lt; 5MB</span>
                      </div>
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        {photoPreview ? (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden ring-2 ring-primary/40 flex-shrink-0 shadow-sm">
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 flex-shrink-0">
                            <SafeIcon icon={FiUsers} className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        )}
                        <label
                          htmlFor="modal-photo"
                          className="flex-1 min-w-0 border-2 border-dashed border-neutral-300 hover:border-primary rounded-xl px-3 sm:px-4 py-2.5 text-left sm:text-center cursor-pointer transition-colors bg-neutral-50/60 hover:bg-neutral-50 flex items-center gap-2.5 sm:justify-center"
                        >
                          <SafeIcon icon={FiUploadCloud} className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
                              {photoFile ? photoFile.name : 'Upload Passport Photo'}
                            </div>
                            <div className="text-[10px] sm:text-xs text-neutral-500">
                              {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB selected` : 'Tap to select from device'}
                            </div>
                          </div>
                          <input
                            type="file"
                            id="modal-photo"
                            name="photo"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {photoError && <p className="text-red-600 text-xs sm:text-sm mt-1.5">{photoError}</p>}
                    </div>

                    {/* Submission Error */}
                    {submitError && (
                      <div className="flex items-start bg-red-50 border border-red-200 rounded-xl p-3 sm:p-3.5">
                        <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 mr-2.5 mt-0.5 flex-shrink-0" />
                        <p className="text-red-700 text-xs sm:text-sm">{submitError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white py-3 sm:py-3.5 px-6 rounded-xl font-bold hover:bg-primary-600 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {isSubmitting ? (
                          <>
                            <SafeIcon icon={FiIcons.FiLoader || FiUsers} className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            <span>Submitting Application...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Application</span>
                            <SafeIcon icon={FiArrowRight} className="w-4 h-4 sm:w-5 sm:h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Join;