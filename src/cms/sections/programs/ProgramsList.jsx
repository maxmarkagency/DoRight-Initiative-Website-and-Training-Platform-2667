import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight, FiCheck, FiTarget } from 'react-icons/fi';
import { ICONS } from '../../fields/iconField';

const ProgramsList = ({ programs = [] }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-12 sm:space-y-16 lg:space-y-20">
        {programs.map((program, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
              <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <SafeIcon icon={ICONS[program.icon] || FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-1 sm:mb-2"> {program.title} </h2>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-4 sm:mb-6"> {program.subtitle} </h3>
              <p className="text-sm sm:text-base lg:text-lg text-neutral-700 mb-6 sm:mb-8 leading-relaxed"> {program.description} </p>
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {(program.features || []).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-neutral-700">{feature.text}</span>
                  </div>
                ))}
              </div>
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center text-sm sm:text-base">
                Learn More
                <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                {program.image?.url && (
                  <img src={program.image.url} alt={program.image.alt || program.title} className="rounded-lg w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent rounded-lg"></div>
                {/* Overlay with program info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="bg-white rounded-lg p-3 sm:p-4">
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-1"> {program.title} </h3>
                    <p className="text-xs sm:text-sm text-neutral-600"> {program.subtitle} </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProgramsList;
