import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiMapPin } from 'react-icons/fi';
import { usePageActions } from '../../pageActions';

const ContactMap = ({
  heading = 'Find Us',
  fallbackAddress = '28b, Olaminuyun street, Parkview, Lagos, Nigeria 101233',
  embedUrl = 'https://maps.google.com/maps?q=Parkview+Estate,+Ikoyi,+Lagos,+Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed',
  directionsLabel = 'Open in Google Maps / Get Directions',
  directionsUrl = 'https://www.google.com/maps/search/?api=1&query=Parkview+Estate+Ikoyi+Lagos+Nigeria',
}) => {
  const { contactSettings } = usePageActions();
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {heading} </h2>
          <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto">
            {(contactSettings && contactSettings.contact_address) || fallbackAddress}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 relative h-72 sm:h-96 lg:h-[450px]">
          <iframe
            title="DoRight Awareness Initiative Office Location"
            src={embedUrl}
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
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-600 transition-colors">
            <SafeIcon icon={FiMapPin} className="w-4 h-4" />
            <span>{directionsLabel}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
