import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { SiTiktok } from 'react-icons/si';
import { FiMail, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { usePageActions } from '../../pageActions';

// The form card and the department column share one two-column section, so they are one
// editor block. The form itself (state, Turnstile, lead insert) is supplied by the page via
// usePageActions().renderContactForm; in the editor it is a static placeholder.
const ContactFormIntro = ({
  formHeading = 'Send Us a Message',
  formText = 'Have a question, partnership proposal, or suggestion? Send us a message and our team will get back to you promptly.',
  successHeading = 'Message Sent Successfully!',
  successText = 'Thank you for reaching out to DoRight. Our team has received your message and will respond to your email shortly.',
  departmentsHeading = 'Department Contacts',
  departmentsText = 'For specific inquiries,you can reach out directly to the relevant department.',
  departments = [],
  followHeading = 'Follow Us',
}) => {
  const { renderContactForm, contactSettings } = usePageActions();
  const socialLinks = (contactSettings && contactSettings.social_links) || {};

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-2"> {formHeading} </h2>
            <p className="text-sm sm:text-base text-neutral-600 mb-6"> {formText} </p>
            {renderContactForm ? (
              renderContactForm({ successHeading, successText })
            ) : (
              <div className="rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center text-neutral-500">Contact form appears here</div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {departmentsHeading} </h2>
            <p className="text-sm sm:text-base text-neutral-700 mb-6 sm:mb-8"> {departmentsText} </p>
            <div className="space-y-4 sm:space-y-6">
              {departments.map((dept, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow">
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2"> {dept.name} </h3>
                  <p className="text-neutral-600 mb-3 text-sm sm:text-base"> {dept.description} </p>
                  <a href={`mailto:${dept.email}`} className="text-primary hover:text-primary-600 font-medium inline-flex items-center text-sm sm:text-base">
                    <SafeIcon icon={FiMail} className="mr-2 w-4 h-4" /> {dept.email}
                  </a>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 sm:mt-12">
              <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {followHeading} </h3>
              <div className="flex space-x-3 sm:space-x-4">
                {[
                  { icon: FiFacebook, href: socialLinks.facebook || '#', label: 'Facebook' },
                  { icon: FiTwitter, href: socialLinks.twitter || '#', label: 'Twitter' },
                  { icon: FiInstagram, href: socialLinks.instagram || 'https://instagram.com/dorightng', label: 'Instagram (@dorightng)' },
                  { icon: FiLinkedin, href: socialLinks.linkedin || '#', label: 'LinkedIn' },
                  { icon: SiTiktok, href: socialLinks.tiktok || '#', label: 'TikTok' },
                ].map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                    <SafeIcon icon={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormIntro;
