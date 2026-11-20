import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiUsers } from 'react-icons/fi';

const TrusteesIntro = ({ heading, text }) => (
  <section className="py-16 bg-white">
    <div className="max-w-container mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
        <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-6"> {heading} </h2>
        <p className="text-lg text-neutral-700 leading-relaxed"> {text} </p>
      </motion.div>
    </div>
  </section>
);

export default TrusteesIntro;
