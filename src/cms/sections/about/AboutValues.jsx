import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiTarget } from 'react-icons/fi';
import { ICONS } from '../../fields/iconField';

const AboutValues = ({ title, subtitle, values = [] }) => (
  <section className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 bg-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {title} </h2>
        <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {subtitle} </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8">
        {values.map((value, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -10, scale: 1.05 }} className="text-center group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, delay: index * 0.1 + 0.2, type: 'spring' }} viewport={{ once: true }} className="bg-neutral-100 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary transition-colors duration-300">
              <SafeIcon icon={ICONS[value.icon] || FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary group-hover:text-white transition-colors duration-300" />
            </motion.div>
            <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {value.title} </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {value.description} </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutValues;
