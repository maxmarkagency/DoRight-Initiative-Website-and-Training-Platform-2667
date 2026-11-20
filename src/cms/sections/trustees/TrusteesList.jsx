import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiHeart, FiTarget } from 'react-icons/fi';

const TrusteesList = ({ trustees = [] }) => (
  <section className="py-20 bg-neutral-100">
    <div className="max-w-container mx-auto px-5">
      <div className="space-y-20">
        {trustees.map((trustee, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
            {/* Profile Content */}
            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
              <div className="bg-white rounded-lg border border-neutral-200 p-8 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <SafeIcon icon={FiTarget} className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-accent px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-neutral-900"> Board of Trustees </span>
                  </div>
                </div>
                <h2 className={`text-h2 font-heading font-bold text-neutral-900 ${trustee.role ? 'mb-2' : 'mb-4'}`}> {trustee.name} </h2>
                {trustee.role && <p className="text-base font-semibold text-primary mb-4">{trustee.role}</p>}
                <p className="text-lg text-neutral-700 mb-6 leading-relaxed"> {trustee.description} </p>
                <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                  <p className="text-neutral-700 leading-relaxed"> {trustee.fullProfile} </p>
                </div>
                <div className="flex items-center text-primary">
                  <SafeIcon icon={FiHeart} className="w-5 h-5 mr-2" />
                  <span className="font-medium"> Committed to Nigeria's transformation through integrity </span>
                </div>
              </div>
            </div>
            {/* Profile Image */}
            {trustee.photo?.url && (
              <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                  <div className="relative overflow-hidden rounded-lg">
                    <img src={trustee.photo.url} alt={trustee.photo.alt || trustee.name || ''} className="w-full h-96 lg:h-[500px] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    {/* Overlay with name */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="bg-white rounded-lg p-4">
                        <h3 className="text-xl font-heading font-bold text-neutral-900 mb-1"> {trustee.name} </h3>
                        <p className="text-sm text-neutral-600"> Trustee #{String(index + 1).padStart(2, '0')} </p>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full opacity-80"></div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary rounded-full opacity-20"></div>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrusteesList;
