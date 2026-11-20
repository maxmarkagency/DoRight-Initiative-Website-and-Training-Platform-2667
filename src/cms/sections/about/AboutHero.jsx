import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiUsers } from 'react-icons/fi';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const AboutHero = ({ heading, headingAccent, badge, text, stats = [] }) => (
  <section className="relative bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 xl:pb-24 overflow-hidden">
    <div className="relative max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
        {badge && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-flex items-center bg-accent text-black rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
            <SafeIcon icon={FiUsers} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base font-semibold">{badge}</span>
          </motion.div>
        )}

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-6 sm:mb-8 leading-tight text-balance">
          {heading}{' '}
          <span className="relative text-accent">
            {headingAccent}
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-0 left-0 h-1 bg-accent rounded-full" />
          </span>
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />

        {/* Floating stats preview */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12">
          {stats.slice(0, 3).map((stat, index) => (
            <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 0.8 + index * 0.1, type: 'spring' }} className="text-center">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-accent mb-1"> {stat.number}{stat.suffix} </div>
              <div className="text-xs sm:text-sm text-neutral-400"> {stat.label} </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default AboutHero;
