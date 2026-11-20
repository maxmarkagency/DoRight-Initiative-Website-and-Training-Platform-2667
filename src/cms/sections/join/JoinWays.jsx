import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { mergeByKey } from '../../fields/fixedList';
import { usePageActions } from '../../pageActions';
import { JOIN_WAYS, WAYS_ID } from './waysData';

const EDITABLE_FIELDS = ['title', 'description', 'ctaText'];

// Stored features are [{ text }]; code features are plain strings.
const toFeatureTexts = (features) =>
  Array.isArray(features) ? features.map((f) => (typeof f === 'string' ? f : f?.text)).filter(Boolean) : [];

// interestKey, icon and colour come from code; stored content only supplies copy.
const JoinWays = ({
  heading = 'Ways to Get Involved',
  subtitle = "Choose how you'd like to contribute to building a better Nigeria. Every form of support makes a meaningful difference.",
  ways,
}) => {
  const { selectWay } = usePageActions();
  const merged = mergeByKey(JOIN_WAYS, ways, 'interestKey', EDITABLE_FIELDS).map((way) => {
    const stored = Array.isArray(ways) ? ways.find((w) => w && w.interestKey === way.interestKey) : null;
    const storedFeatures = toFeatureTexts(stored?.features);
    return { ...way, features: storedFeatures.length ? storedFeatures : way.features };
  });

  return (
    <section id={WAYS_ID} className="py-20 bg-neutral-100">
      <div className="max-w-container mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4">{heading}</h2>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {merged.map((way, index) => {
            const isDonate = way.interestKey === 'Donating';
            return (
              <motion.div
                key={way.interestKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`p-6 ${way.color}`}>
                    <SafeIcon icon={way.icon} className={`w-12 h-12 ${isDonate ? 'text-neutral-900' : 'text-white'} mb-4`} />
                    <h3 className={`text-h3 font-heading font-bold ${isDonate ? 'text-neutral-900' : 'text-white'} mb-2`}>
                      {way.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-neutral-700 mb-6 leading-relaxed">{way.description}</p>
                    <div className="space-y-3 mb-8">
                      {way.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                          <span className="text-neutral-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    onClick={() => selectWay(way.interestKey)}
                    className={`w-full ${isDonate ? 'bg-accent text-neutral-900 hover:brightness-90' : 'bg-primary text-white hover:bg-primary-600'} px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center`}
                  >
                    {way.ctaText}
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JoinWays;
