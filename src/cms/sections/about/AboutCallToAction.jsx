import React from 'react';
import { motion } from 'framer-motion';
import ButtonLink from '../ButtonLink';

const AboutCallToAction = ({ heading, text, primaryButton, secondaryButton }) => (
  <section className="py-20 bg-primary text-white relative overflow-hidden">
    <div className="relative max-w-container mx-auto px-5 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <h2 className="text-h2 font-heading font-bold mb-6"> {heading} </h2>
        <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> {text} </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton?.label && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonLink href={primaryButton.href} className="bg-accent text-black px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center"> {primaryButton.label} </ButtonLink>
            </motion.div>
          )}
          {secondaryButton?.label && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonLink href={secondaryButton.href} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> {secondaryButton.label} </ButtonLink>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);

export default AboutCallToAction;
