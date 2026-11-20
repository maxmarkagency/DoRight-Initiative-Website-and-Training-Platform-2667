import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiCalendar } from 'react-icons/fi';

const AboutTimeline = ({ title, subtitle, items = [] }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-white">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {title} </h2>
        <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {subtitle} </p>
      </motion.div>
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 sm:w-1 bg-primary h-full hidden sm:block"></div>
        <div className="space-y-8 sm:space-y-12">
          {items.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`flex items-center ${index % 2 === 0 ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row-reverse'} gap-4`}>
              <div className={`w-full sm:w-1/2 ${index % 2 === 0 ? 'sm:pr-8 sm:text-right text-center' : 'sm:pl-8 text-center'}`}>
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow duration-300">
                  <div className="flex items-center justify-center sm:justify-start mb-3">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
                    <span className="text-primary font-bold text-base sm:text-lg">{item.year}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> {item.title} </h3>
                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {item.description} </p>
                </motion.div>
              </div>
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, delay: index * 0.1 + 0.3, type: 'spring' }} viewport={{ once: true }} className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full relative z-10 hidden sm:block" />
              <div className="w-full sm:w-1/2"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutTimeline;
