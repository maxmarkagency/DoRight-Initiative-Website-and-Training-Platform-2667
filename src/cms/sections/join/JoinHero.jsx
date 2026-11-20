import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight } from 'react-icons/fi';
import { usePageActions } from '../../pageActions';
import { WAYS_ID } from './waysData';

const JoinHero = ({
  title = 'Join the Movement',
  subtitle = 'Become part of a growing community of Nigerians committed to building a more transparent, accountable, and integrity-driven society. Together, we can create lasting change.',
  applyLabel = 'Apply to Join',
  exploreLabel = 'Explore Opportunities',
}) => {
  const { selectWay } = usePageActions();
  const scrollToWays = () => document.getElementById(WAYS_ID)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-20">
      <div className="max-w-container mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-h1 font-heading font-bold mb-6 leading-tight">{title}</h1>
          <p className="text-xl text-neutral-300 leading-relaxed mb-8">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => selectWay('Volunteering')}
              className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center text-lg"
            >
              {applyLabel}
              <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={scrollToWays}
              className="border-2 border-white/80 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all inline-flex items-center justify-center text-lg"
            >
              {exploreLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default JoinHero;
