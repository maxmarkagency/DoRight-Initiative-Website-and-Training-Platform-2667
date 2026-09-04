import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { SiTiktok } from 'react-icons/si';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import { getPageContent, getSectionByKey } from '../services/pageContentService';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import useSeo from '../hooks/useSeo';

const { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiSend, FiCheck, FiAlertCircle, FiCheckCircle, FiLoader } = FiIcons;

const Contact = () => {
  useSeo({
    path: '/contact',
    title: 'Contact Us',
    description: "Reach the DoRight Awareness Initiative team for program inquiries, partnerships, volunteering, media, or general questions.",
  });

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [sections, setSections] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    getPageContent('contact').then(setSections);
    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['contact_email', 'contact_phone', 'contact_address', 'social_links'])
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading contact settings:', error);
          return;
        }
        const settings = {};
        (data || []).forEach((row) => { settings[row.setting_key] = row.setting_value; });
        setSiteSettings(settings);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (contactError) setContactError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setContactError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setContactError('Please enter your full name.');
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setContactError('Please provide a valid email address so we can reply to you.');
      return;
    }

    if (!formData.subject || formData.subject.trim().length < 2) {
      setContactError('Please enter a brief subject for your inquiry.');
      return;
    }

    if (!formData.message || formData.message.trim().length < 10) {
      setContactError('Please provide a little more detail in your message (at least 10 characters).');
      return;
    }

    setIsSending(true);

    try {
      const trimmedName = formData.name.trim();
      const trimmedEmail = formData.email.trim().toLowerCase();
      const trimmedSubject = formData.subject.trim();
      const trimmedMessage = formData.message.trim();

      const leadPayload = {
        full_name: trimmedName,
        email: trimmedEmail,
        source: 'contact_page',
        status: 'new',
        admin_notes: `Subject: ${trimmedSubject}\nMessage: ${trimmedMessage}`,
        created_at: new Date().toISOString(),
      };

      // 1. Record lead to database
      try {
        await supabase.from('leads').insert(leadPayload);
      } catch (dbErr) {
        console.warn('Could not insert contact lead to database:', dbErr);
      }

      // 2. Dispatch instant notification to info@doright.ng and user auto-reply
      try {
        await supabase.functions.invoke('send-lead-welcome-email', {
          body: {
            type: 'INSERT',
            source: 'contact_page',
            record: {
              ...leadPayload,
              subject: trimmedSubject,
              message: trimmedMessage,
            },
          },
        });
      } catch (fnErr) {
        console.warn('send-lead-welcome-email contact trigger warning:', fnErr);
      }

      setIsSending(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting contact message:', err);
      setIsSending(false);
      setContactError('An unexpected error occurred. Please try sending again or write directly to info@doright.ng.');
    }
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
    setContactError('');
  };

  const heroSection = getSectionByKey(sections, 'hero');
  const socialLinks = siteSettings.social_links || {};

  const rawPhone = siteSettings.contact_phone;
  const contactPhone =
    !rawPhone || rawPhone.includes('XXX') || rawPhone.includes('123 456') || rawPhone.trim() === ''
      ? '+234 912 339 9968'
      : rawPhone;

  const rawAddress = siteSettings.contact_address;
  const contactAddress =
    !rawAddress || rawAddress.includes('123 Integrity') || rawAddress.trim() === '' || rawAddress === 'Lagos, Nigeria'
      ? '28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria 101233'
      : rawAddress;

  const rawEmail = siteSettings.contact_email;
  const contactEmail = !rawEmail || rawEmail.trim() === '' ? 'info@doright.ng' : rawEmail;

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email Us',
      details: [contactEmail, 'volunteer@doright.ng'],
      color: 'text-primary'
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      details: [contactPhone],
      color: 'text-primary'
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      details: ['DoRight Awareness Initiative', contactAddress],
      color: 'text-primary'
    }
  ];

  const departments = [
    { name: 'General Inquiries', email: 'info@doright.ng', description: 'General questions about our organization and programs' },
    { name: 'Partnerships', email: 'partnerships@doright.ng', description: 'Collaboration opportunities and strategic partnerships' },
    { name: 'Volunteer Coordination', email: 'volunteer@doright.ng', description: 'Volunteer opportunities and community engagement' },
    { name: 'Media & Press', email: 'media@doright.ng', description: 'Press inquiries and media relations' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6 leading-tight"> {heroSection?.title || 'Get in Touch'} </h1>
            <div className="text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(heroSection?.content || "We'd love to hear from you. Whether you have questions about our programs,want to get involved,or need support,we're here to help.") }} />
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Contact Information </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Multiple ways to reach us. Choose the method that works best for you. </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.div key={info.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center bg-neutral-50/70 p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col items-center">
                <div className={`${info.color} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 bg-white shadow-sm border border-neutral-200 rounded-full flex items-center justify-center`}>
                  <SafeIcon icon={info.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {info.title} </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {info.details.map((detail, detailIndex) => {
                    const isPhone = detail.startsWith('+');
                    const isEmail = detail.includes('@');
                    if (isPhone) {
                      return (
                        <p key={detailIndex} className="text-sm sm:text-base">
                          <a
                            href={`tel:${detail.replace(/\s+/g, '')}`}
                            className="font-semibold text-primary hover:text-primary-600 transition-colors"
                          >
                            {detail}
                          </a>
                        </p>
                      );
                    }
                    if (isEmail) {
                      return (
                        <p key={detailIndex} className="text-sm sm:text-base">
                          <a
                            href={`mailto:${detail}`}
                            className="text-neutral-700 hover:text-primary transition-colors"
                          >
                            {detail}
                          </a>
                        </p>
                      );
                    }
                    return (
                      <p key={detailIndex} className="text-sm sm:text-base text-neutral-700">
                        {detail}
                      </p>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-2"> Send Us a Message </h2>
              <p className="text-sm sm:text-base text-neutral-600 mb-6"> Have a question, partnership proposal, or suggestion? Send us a message and our team will get back to you promptly. </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What is your message regarding?"
                      className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your inquiry..."
                      className="w-full px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-all resize-none"
                    />
                  </div>

                  {contactError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                      <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-primary text-white px-6 py-3 sm:py-3.5 rounded-xl font-bold hover:bg-primary-600 active:scale-[0.99] transition-all inline-flex items-center justify-center text-sm sm:text-base shadow-sm disabled:opacity-60 gap-2"
                  >
                    {isSending ? (
                      <>
                        <SafeIcon icon={FiLoader} className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <SafeIcon icon={FiCheckCircle} className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-950 mb-1.5"> Message Sent Successfully! </h3>
                    <p className="text-sm sm:text-base text-emerald-800 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out to DoRight. Our team has received your message and will respond to your email shortly.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
            {/* Departments */}
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Department Contacts </h2>
              <p className="text-sm sm:text-base text-neutral-700 mb-6 sm:mb-8"> For specific inquiries,you can reach out directly to the relevant department. </p>
              <div className="space-y-4 sm:space-y-6">
                {departments.map((dept, index) => (
                  <motion.div key={dept.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow">
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2"> {dept.name} </h3>
                    <p className="text-neutral-600 mb-3 text-sm sm:text-base"> {dept.description} </p>
                    <a href={`mailto:${dept.email}`} className="text-primary hover:text-primary-600 font-medium inline-flex items-center text-sm sm:text-base">
                      <SafeIcon icon={FiMail} className="mr-2 w-4 h-4" /> {dept.email}
                    </a>
                  </motion.div>
                ))}
              </div>
              {/* Social Media */}
              <div className="mt-8 sm:mt-12">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Follow Us </h3>
                <div className="flex space-x-3 sm:space-x-4">
                  {[
                    { icon: FiFacebook, href: socialLinks.facebook || '#', label: 'Facebook' },
                    { icon: FiTwitter, href: socialLinks.twitter || '#', label: 'Twitter' },
                    { icon: FiInstagram, href: socialLinks.instagram || 'https://instagram.com/dorightng', label: 'Instagram (@dorightng)' },
                    { icon: FiLinkedin, href: socialLinks.linkedin || '#', label: 'LinkedIn' },
                    { icon: SiTiktok, href: socialLinks.tiktok || '#', label: 'TikTok' }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                    >
                      <SafeIcon icon={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Find Us </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto">
              {siteSettings.contact_address || '28b, Olaminuyun street, Parkview, Lagos, Nigeria 101233'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 relative h-72 sm:h-96 lg:h-[450px]"
          >
            <iframe
              title="DoRight Awareness Initiative Office Location"
              src="https://maps.google.com/maps?q=Parkview+Estate,+Ikoyi,+Lagos,+Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </motion.div>

          <div className="mt-4 text-center">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Parkview+Estate+Ikoyi+Lagos+Nigeria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              <SafeIcon icon={FiMapPin} className="w-4 h-4" />
              <span>Open in Google Maps / Get Directions</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Frequently Asked Questions </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Quick answers to common questions about our organization and programs. </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { question: 'How can I volunteer with DoRight?', answer: 'You can apply to volunteer through our Join page or contact our volunteer coordinator directly. We offer flexible opportunities that match your skills and availability.' },
              { question: 'How can I become an official DoRight Advocate?', answer: 'Anyone committed to uprightness can join as a Tier 1 Personal Advocate through our Join Us page, instantly receive an official digital membership card, and join our active community.' },
              { question: 'How do I report corruption or misconduct?', answer: 'You can use our anonymous reporting hotline or digital platform. All reports are handled confidentially and with appropriate follow-up.' },
              { question: 'Can my organization partner with DoRight?', answer: 'We welcome partnerships with organizations that share our values. Contact our partnerships team to discuss collaboration opportunities.' }
            ].map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-heading font-bold text-neutral-900 mb-3"> {faq.question} </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {faq.answer} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;