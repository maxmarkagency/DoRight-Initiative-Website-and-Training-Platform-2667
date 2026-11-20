import React from 'react';
import { motion } from 'framer-motion';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const ProgramsHero = ({ title, text }) => (
  <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6 leading-tight"> {title} </h1>
        <div className="text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />
      </motion.div>
    </div>
  </section>
);

export default ProgramsHero;
