import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiShield } from 'react-icons/fi';
import { sanitizeHtml } from '../../../lib/sanitizeHtml';

const PARAGRAPH_CLASSES = [
  'text-sm sm:text-base text-slate-200 leading-relaxed',
  'text-sm sm:text-base text-slate-300 leading-relaxed',
  'text-sm sm:text-base text-amber-300/90 font-medium',
];

const SubCommitteesHero = ({ badge, title, greetingHeading, paragraphs = [] }) => (
  <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Leadership Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
          <SafeIcon icon={FiShield} className="w-4 h-4 text-amber-400" />
          <span>{badge}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight leading-tight">
          {title}
        </h1>

        {/* Strategic Leader Greeting Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl space-y-4">
          <div className="text-amber-400 font-extrabold text-lg sm:text-xl font-heading">
            {greetingHeading}
          </div>
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={PARAGRAPH_CLASSES[index] || PARAGRAPH_CLASSES[1]}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(paragraph.text) }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default SubCommitteesHero;
