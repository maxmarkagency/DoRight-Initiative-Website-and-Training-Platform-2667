import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getSubCommitteeDetails } from '../services/leadsService';

const { FiUsers, FiArrowRight } = FiIcons;

const SubCommittees = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubCommitteeDetails().then((data) => {
      setCommittees(data);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white pt-24 sm:pt-28 lg:pt-32 pb-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> Our Sub-Committees </h1>
            <p className="text-xl text-neutral-300 leading-relaxed"> Every member finds a home in one of five sub-committees. Here's what each one actually does,so you can choose where your time and skills make the most difference. </p>
          </motion.div>
        </div>
      </section>

      {/* Committees List */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          {loading ? (
            <div className="space-y-6 max-w-3xl mx-auto" aria-busy="true" aria-live="polite">
              {[1, 2, 3, 4, 5].map((key) => (
                <div key={key} className="bg-neutral-100 rounded-lg p-8 animate-pulse">
                  <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : committees.length === 0 ? (
            <p className="text-center text-lg text-neutral-700 max-w-2xl mx-auto"> Sub-committee details aren't available right now. Please check back soon,or reach out via the <Link to="/contact" className="text-primary font-semibold hover:underline">contact page</Link> with any questions. </p>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {committees.map((committee, index) => (
                <motion.div
                  key={committee.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-neutral-50 rounded-lg border border-neutral-200 p-8"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <SafeIcon icon={FiUsers} className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-h3 font-heading font-bold text-neutral-900"> {committee.name} </h2>
                  </div>
                  <p className="text-lg text-neutral-700 leading-relaxed"> {committee.description || 'Details for this sub-committee are coming soon.'} </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-h2 font-heading font-bold mb-6"> Found Your Committee? </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> Fill out the join form and tell us which sub-committee fits you best. We'll follow up within 24 hours. </p>
            <Link to="/join" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
              Join a Sub-Committee
              <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default SubCommittees;
