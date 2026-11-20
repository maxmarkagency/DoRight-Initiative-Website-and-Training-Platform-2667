import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiUsers, FiTarget } from 'react-icons/fi';

const Block = ({ block, icon, iconBg, iconColor, initial, delay }) => (
  <motion.div initial={initial} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ...(delay ? { delay } : {}) }} viewport={{ once: true }} className="bg-white rounded-lg border border-neutral-200 p-6 sm:p-8">
    {block.image?.url && (
      <img src={block.image.url} alt={block.image.alt || block.title} className="rounded-lg w-full h-48 object-cover mb-4 sm:mb-6" />
    )}
    <div className={`${iconBg} w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6`}>
      <SafeIcon icon={icon} className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
    </div>
    <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {block.title} </h3>
    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-3 sm:mb-4"> {block.text} </p>
    <ul className="text-xs sm:text-sm text-neutral-600 space-y-1 sm:space-y-2">
      {(block.bullets || []).map((bullet, i) => (
        <li key={i}>• {bullet.text}</li>
      ))}
    </ul>
  </motion.div>
);

const ProgramsRealImpact = ({ title, text, classroom = {}, community = {} }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {title} </h2>
        <p className="text-sm sm:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed"> {text} </p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Block block={classroom} icon={FiUsers} iconBg="bg-primary/10" iconColor="text-primary" initial={{ opacity: 0, x: -30 }} />
        <Block block={community} icon={FiTarget} iconBg="bg-accent/10" iconColor="text-accent" initial={{ opacity: 0, x: 30 }} delay={0.2} />
      </div>
    </div>
  </section>
);

export default ProgramsRealImpact;
