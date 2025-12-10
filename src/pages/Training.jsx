import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiUsers, FiBookOpen, FiTarget, FiUser, FiClock, FiAward, FiPlay, FiLock, FiCheck } = FiIcons;

const Training = () => {
  const { isAuthenticated } = useAuth();

  const howItWorksSteps = [
    {
      title: 'Sign Up',
      description: 'Create a free account to access our training platform and track your progress.',
      icon: FiUser,
    },
    {
      title: 'Choose Course',
      description: 'Browse our catalog of integrity and leadership courses designed for different levels.',
      icon: FiBookOpen,
    },
    {
      title: 'Complete Training',
      description: 'Work through interactive modules, quizzes, and practical assignments at your own pace.',
      icon: FiClock,
    },
    {
      title: 'Get Certified',
      description: 'Earn verified certificates upon completion to showcase your commitment to integrity.',
      icon: FiAward,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section with Real Training Image */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6 leading-tight"> Training & Certification </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-neutral-300"> Complete structured courses,earn certificates,and unlock advanced training modules to deepen your knowledge of integrity and leadership. </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard/courses" className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                      Browse Courses
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <Link to="/training/dashboard" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> Training Dashboard </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                      Get Started Free
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                    <a href="#approach" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> Learn More </a>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative order-1 lg:order-2">
              <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686439881-Do-right-awarenss-initiative-school-project-12-scaled-2-1536x1024.jpg" alt="DoingRight training session with educators and participants" className="rounded-lg shadow-2xl w-full h-auto max-h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg"></div>
              {/* Overlay with training info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg sm:text-xl md:text-2xl font-heading font-bold mb-1 sm:mb-2"> Real Training in Action </motion.h3>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xs sm:text-sm md:text-base text-neutral-200 leading-relaxed"> DoingRight educators conducting interactive training sessions with students and community members across Nigeria. </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Training Approach Section */}
      <section id="approach" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Our Training Approach </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed"> Experience authentic DoingRight training through our comprehensive programs that combine classroom learning,community engagement,and practical application of integrity principles. </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Interactive Learning */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686439881-Do-right-awarenss-initiative-school-project-12-scaled-2-1536x1024.jpg" alt="Interactive DoingRight training session" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"> Interactive Learning </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <SafeIcon icon={FiUsers} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> Classroom Engagement </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> Our trainers work directly with participants in interactive sessions,fostering discussions about integrity,leadership,and civic responsibility through practical exercises. </p>
              </div>
            </motion.div>
            {/* Resource Distribution */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686560981-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg" alt="DoingRight educational resource distribution" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-medium"> Resource Sharing </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="bg-accent/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <SafeIcon icon={FiBookOpen} className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> Educational Materials </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> We provide comprehensive educational materials and resources to support learning,ensuring participants have access to quality content and reference materials. </p>
              </div>
            </motion.div>
            {/* Community Mentorship */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686583500-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg" alt="DoingRight community mentorship and engagement" className="w-full h-40 sm:h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"> Mentorship </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <SafeIcon icon={FiTarget} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> Personal Mentorship </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> One-on-one mentorship and guidance from experienced DoingRight educators,helping participants apply integrity principles in their personal and professional lives. </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication Notice for Non-Logged Users */}
      {!isAuthenticated && (
        <section className="py-12 sm:py-16 bg-neutral-50">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="bg-primary w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <SafeIcon icon={FiUser} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Start Your Learning Journey </h2>
                <p className="text-sm sm:text-lg text-neutral-700 mb-4 sm:mb-6 leading-relaxed"> Create a free account to access our comprehensive training courses,track your progress,and earn certificates upon completion. </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/login" className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                    Create Free Account
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> Sign In </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> How It Works </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Our structured learning approach ensures you build knowledge progressively and earn verified credentials for your achievements. </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <SafeIcon icon={step.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> {step.title} </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {step.description} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4 sm:mb-6"> Ready to Start Learning? </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto"> Begin your journey toward becoming a certified integrity champion and community leader. </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard/courses" className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                    Browse Courses
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link to="/training/dashboard" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> View Dashboard </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                    Get Started Free
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> Sign Up / Login </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};
export default Training;