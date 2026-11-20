import React from 'react';
import { motion } from 'framer-motion';

const TrusteesHero = ({ heading, text }) => (
  <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-20">
    <div className="max-w-container mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
        <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> {heading} </h1>
        <p className="text-xl text-neutral-300 leading-relaxed"> {text} </p>
      </motion.div>
    </div>
  </section>
);

export default TrusteesHero;
