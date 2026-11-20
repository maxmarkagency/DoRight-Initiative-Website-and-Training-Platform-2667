import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight } from 'react-icons/fi';
import ButtonLink from '../ButtonLink';

const ProgramsGetInvolved = ({ heading, text, primaryButton, secondaryButton }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-primary text-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4 sm:mb-6"> {heading} </h2>
        <p className="text-base sm:text-lg md:text-xl text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto"> {text} </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          {primaryButton?.label && (
            <ButtonLink href={primaryButton.href} className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
              {primaryButton.label}
              <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </ButtonLink>
          )}
          {secondaryButton?.label && (
            <ButtonLink href={secondaryButton.href} className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> {secondaryButton.label} </ButtonLink>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);

export default ProgramsGetInvolved;
