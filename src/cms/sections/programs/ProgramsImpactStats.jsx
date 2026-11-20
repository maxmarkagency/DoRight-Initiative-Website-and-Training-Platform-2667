import React from 'react';
import { motion } from 'framer-motion';

const ProgramsImpactStats = ({ stats = [] }) => (
  <section className="py-12 sm:py-16 bg-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2"> {stat.number} </div>
            <div className="text-sm sm:text-base text-neutral-700 font-medium"> {stat.label} </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProgramsImpactStats;
