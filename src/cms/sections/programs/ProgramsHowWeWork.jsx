import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiTarget } from 'react-icons/fi';
import { ICONS } from '../../fields/iconField';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const ProgramsHowWeWork = ({ title, text, items = [] }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {title} </h2>
        <div className="text-sm sm:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
            <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <SafeIcon icon={ICONS[item.icon] || FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {item.title} </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {item.description} </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProgramsHowWeWork;
