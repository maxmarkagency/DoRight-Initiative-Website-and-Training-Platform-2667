import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { usePageActions } from '../../pageActions';
import { isSafeEmail } from './safeLinks';

// Email/phone/address values come from site_settings (passed in via page actions);
// editors only change the headings and labels around them.
const ContactInfoIntro = ({
  heading = 'Contact Information',
  text = 'Multiple ways to reach us. Choose the method that works best for you.',
  emailTitle = 'Email Us',
  extraEmail = 'volunteer@doright.ng',
  phoneTitle = 'Call Us',
  addressTitle = 'Visit Us',
  organisationName = 'DoRight Awareness Initiative',
}) => {
  const { contactSettings } = usePageActions();
  const settings = contactSettings || {};

  const rawPhone = settings.contact_phone;
  const contactPhone =
    !rawPhone || rawPhone.includes('XXX') || rawPhone.includes('123 456') || rawPhone.trim() === ''
      ? '+234 912 339 9968'
      : rawPhone;

  const rawAddress = settings.contact_address;
  const contactAddress =
    !rawAddress || rawAddress.includes('123 Integrity') || rawAddress.trim() === '' || rawAddress === 'Lagos, Nigeria'
      ? '28b, Olaminuyun street, Parkview, Ikoyi, Lagos, Nigeria 101233'
      : rawAddress;

  const rawEmail = settings.contact_email;
  const contactEmail = !rawEmail || rawEmail.trim() === '' ? 'info@doright.ng' : rawEmail;

  const contactInfo = [
    { icon: FiMail, title: emailTitle, details: [contactEmail, extraEmail].filter(Boolean), color: 'text-primary' },
    { icon: FiPhone, title: phoneTitle, details: [contactPhone], color: 'text-primary' },
    { icon: FiMapPin, title: addressTitle, details: [organisationName, contactAddress].filter(Boolean), color: 'text-primary' },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {heading} </h2>
          <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {text} </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {contactInfo.map((info, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center bg-neutral-50/70 p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col items-center">
              <div className={`${info.color} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 bg-white shadow-sm border border-neutral-200 rounded-full flex items-center justify-center`}>
                <SafeIcon icon={info.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {info.title} </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {info.details.map((detail, detailIndex) => {
                  const isPhone = detail.startsWith('+');
                  const isEmail = detail.includes('@') && isSafeEmail(detail);
                  if (isPhone) {
                    return (
                      <p key={detailIndex} className="text-sm sm:text-base">
                        <a href={`tel:${detail.replace(/\s+/g, '')}`} className="font-semibold text-primary hover:text-primary-600 transition-colors">
                          {detail}
                        </a>
                      </p>
                    );
                  }
                  if (isEmail) {
                    return (
                      <p key={detailIndex} className="text-sm sm:text-base">
                        <a href={`mailto:${detail}`} className="text-neutral-700 hover:text-primary transition-colors">
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
  );
};

export default ContactInfoIntro;
