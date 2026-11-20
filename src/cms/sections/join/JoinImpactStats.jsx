import React from 'react';
import { motion } from 'framer-motion';

const JoinImpactStats = ({
  heading = 'Our Growing Impact',
  subtitle = 'See how our community is making a difference across Nigeria',
  stats = [],
}) => (
  <section className="py-16 bg-neutral-50">
    <div className="max-w-container mx-auto px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">{heading}</h2>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto">{subtitle}</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
            <div className="text-neutral-700 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default JoinImpactStats;
