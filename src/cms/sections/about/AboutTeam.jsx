import React from 'react';
import { motion } from 'framer-motion';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const AboutTeam = ({ title, subtitle, image, photoTitle, photoText }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {title} </h2>
        <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {subtitle} </p>
      </motion.div>

      {/* Team Photo */}
      {image?.url && (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-12 sm:mb-16">
          <div className="relative overflow-hidden rounded-lg">
            <img src={image.url} alt={image.alt || ''} className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white mb-2 sm:mb-3"> {photoTitle} </motion.h3>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="text-sm sm:text-base lg:text-lg text-neutral-200 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: sanitizeHtml(photoText) }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  </section>
);

export default AboutTeam;
