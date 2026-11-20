import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiTarget, FiEye } from 'react-icons/fi';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const AboutMissionVision = ({ missionTitle, missionText, visionTitle, visionText }) => (
  <section className="pt-12 sm:pt-16 lg:pt-20 bg-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center mb-12 sm:mb-16 lg:mb-20">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, type: 'spring' }} viewport={{ once: true }} className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <SafeIcon icon={FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {missionTitle} </h2>
          <div className="text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(missionText) }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, type: 'spring' }} viewport={{ once: true }} className="bg-accent w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <SafeIcon icon={FiEye} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-neutral-900" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {visionTitle} </h2>
          <div className="text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(visionText) }} />
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutMissionVision;
