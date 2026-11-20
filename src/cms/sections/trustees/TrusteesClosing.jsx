import React from 'react';
import { motion } from 'framer-motion';
import ButtonLink from '../ButtonLink';

const TrusteesClosing = ({ heading, text, primaryButton, secondaryButton }) => (
  <section className="py-20 bg-primary text-white">
    <div className="max-w-container mx-auto px-5 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <h2 className="text-h2 font-heading font-bold mb-6"> {heading} </h2>
        <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> {text} </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButton?.label && (
            <ButtonLink href={primaryButton.href} className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center"> {primaryButton.label} </ButtonLink>
          )}
          {secondaryButton?.label && (
            <ButtonLink href={secondaryButton.href} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> {secondaryButton.label} </ButtonLink>
          )}
        </div>
      </motion.div>
    </div>
  </section>
);

export default TrusteesClosing;
