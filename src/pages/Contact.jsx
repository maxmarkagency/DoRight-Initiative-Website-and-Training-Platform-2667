import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';
import useSeo from '../hooks/useSeo';
import TurnstileWidget from '../components/TurnstileWidget';
import usePageContent from '../cms/usePageContent';
import PageRenderer from '../cms/PageRenderer';
import contactConfig from '../cms/pages/contact.config';
import { PageActionsContext } from '../cms/pageActions';

const { FiSend, FiAlertCircle, FiCheckCircle, FiLoader } = FiIcons;

// The form (state, honeypot, Turnstile, lead insert) stays here; the CMS section only supplies the
// surrounding copy and renders this via the page actions.
const ContactForm = ({ successHeading, successText }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (contactError) setContactError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setContactError('');

    // Anti-bot check 1: Honeypot trap check
    if (honeypot && honeypot.trim().length > 0) {
      console.warn('Bot blocked via honeypot on contact form');
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
        setIsSubmitted(true);
      }, 700);
      return;
    }

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

    if (!turnstileToken) {
      setContactError('Please complete the security verification challenge before sending.');
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
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
    setContactError('');
    setHoneypot('');
    setTurnstileToken('');
    turnstileRef.current?.reset();
  };

  return (
    <>
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

      {/* Anti-bot honeypot field */}
      <div style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true" tabIndex={-1}>
        <label htmlFor="contact-hp">Website URL (leave blank)</label>
        <input
          type="text"
          id="contact-hp"
          name="website_url_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Cloudflare Turnstile Verification Widget */}
      <TurnstileWidget
        ref={turnstileRef}
        onVerify={(token) => {
          setTurnstileToken(token);
          if (contactError) setContactError('');
        }}
        onExpire={() => setTurnstileToken('')}
        onError={() => setTurnstileToken('')}
      />

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
        <h3 className="text-lg sm:text-xl font-bold text-emerald-950 mb-1.5"> {successHeading} </h3>
        <p className="text-sm sm:text-base text-emerald-800 max-w-md mx-auto leading-relaxed">
          {successText}
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
    </>
  );
};

// Content is edited in Admin → Pages → Contact; defaults live in src/cms/pages/contact.config.js.
// Contact details (email/phone/address/social) still come from site_settings.
const Contact = () => {
  const { data, ready } = usePageContent('contact');
  const [siteSettings, setSiteSettings] = useState({});

  useSeo({
    path: '/contact',
    title: data.root.props.seoTitle,
    description: data.root.props.seoDescription,
  });

  useEffect(() => {
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

  const actions = {
    renderContactForm: (props) => <ContactForm {...props} />,
    contactSettings: siteSettings,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {ready ? (
        <PageActionsContext.Provider value={actions}>
          <PageRenderer data={data} config={contactConfig} />
        </PageActionsContext.Provider>
      ) : (
        // Hero-sized placeholder keeps the transparent header readable while content loads.
        <div className="min-h-[320px] bg-primary" aria-hidden="true" />
      )}
    </motion.div>
  );
};

export default Contact;
