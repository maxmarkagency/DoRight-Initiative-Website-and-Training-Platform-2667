import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight } from 'react-icons/fi';
import ButtonLink from '../ButtonLink';

const HomeCallToAction = ({ heading, text, primaryButton, secondaryButton }) => (
  <section className="py-16 sm:py-24 bg-white text-black w-full relative overflow-hidden">
    <div className="relative w-full max-w-container mx-auto px-4 sm:px-5 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-6">{heading}</h2>
        <p className="text-lg sm:text-xl text-neutral-700 mb-10 max-w-3xl mx-auto leading-relaxed">{text}</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {primaryButton?.label && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonLink href={primaryButton.href} className="bg-accent text-black px-10 py-5 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center text-lg">
                {primaryButton.label}
                <SafeIcon icon={FiArrowRight} className="ml-2 w-6 h-6" />
              </ButtonLink>
            </motion.div>
          )}
          {secondaryButton?.label && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonLink href={secondaryButton.href} className="border-2 border-black text-black px-10 py-5 rounded-lg font-semibold hover:bg-black hover:text-white transition-all duration-300 inline-flex items-center justify-center text-lg">
                {secondaryButton.label}
              </ButtonLink>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);

export default HomeCallToAction;
