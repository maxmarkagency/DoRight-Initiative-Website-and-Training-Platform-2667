import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight } from 'react-icons/fi';
import ButtonLink from '../ButtonLink';
import { ICONS } from '../../fields/iconField';

const HomePrograms = ({ heading, intro, cards = [], cardLinkLabel, cardLinkHref }) => (
  <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white w-full">
    <div className="w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 sm:mb-6">{heading}</h2>
        <p className="text-sm sm:text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">{intro}</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {cards.map((card, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 sm:p-8 border border-neutral-200 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow duration-300 flex flex-col h-full">
            <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-6 flex-shrink-0">
              <SafeIcon icon={ICONS[card.icon]} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-accent" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-black mb-3 sm:mb-4">{card.title}</h3>
            <p className="text-neutral-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow break-words">{card.description}</p>
            {cardLinkLabel && (
              <ButtonLink href={cardLinkHref} className="text-black font-semibold inline-flex items-center text-sm sm:text-base mt-auto hover:text-accent transition-colors">
                {cardLinkLabel}
                <SafeIcon icon={FiArrowRight} className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </ButtonLink>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HomePrograms;
