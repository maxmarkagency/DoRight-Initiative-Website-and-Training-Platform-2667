import React from 'react';
import { motion } from 'framer-motion';

const AboutImpact = ({ title, subtitle, stats = [] }) => (
  <section className="py-20 bg-neutral-50">
    <div className="max-w-container mx-auto px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
        <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> {title} </h2>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> {subtitle} </p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }} className="text-center bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow duration-300">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.8, delay: index * 0.1 + 0.3, type: 'spring' }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {stat.number}{stat.suffix}
            </motion.div>
            <div className="text-neutral-700 font-medium"> {stat.label} </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutImpact;
