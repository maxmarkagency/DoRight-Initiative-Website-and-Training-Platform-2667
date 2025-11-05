import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTraining } from '../context/TrainingContext';
import { courses } from '../data/courses';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiLock, FiCheck, FiClock, FiAward, FiArrowRight, FiUsers, FiBookOpen, FiTarget, FiUser } = FiIcons;

const Training = () => {
  const { isAuthenticated } = useAuth();
  const { progress, isCourseUnlocked, isCourseComplete } = useTraining();

  const getCourseStatus = (course) => {
    const isUnlocked = isCourseUnlocked(course, courses);
    const isComplete = isCourseComplete(course);
    const courseProgress = progress[course.id];
    const completedLessons = courseProgress?.completedLessons?.length || 0;
    const totalLessons = course.lessons.length;
    return { isUnlocked, isComplete, completedLessons, totalLessons, isCertified: courseProgress?.certified || false };
  };

  const howItWorksSteps = [
    { title: 'Create Account', description: 'Sign up for free to access our comprehensive training platform', icon: FiUser },
    { title: 'Complete Lessons & Quizzes', description: 'Watch video lessons and complete assessments at your own pace', icon: FiClock },
    { title: 'Claim Certificate', description: 'Pass the final assessment to earn your verified certificate', icon: FiAward },
    { title: 'Unlock Next Course', description: 'Use your certificate to access more advanced training modules', icon: FiArrowRight }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section with Real Training Image */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> Training & Certification </h1>
              <p className="text-xl mb-8 text-neutral-300"> Complete structured courses,earn certificates,and unlock advanced training modules to deepen your knowledge of integrity and leadership. </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <a href="#courses" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
                      Browse Courses
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                    </a>
                    <Link to="/training/dashboard" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Training Dashboard </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
                      Get Started Free
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                    </Link>
                    <a href="#courses" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Learn More </a>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686439881-Do-right-awarenss-initiative-school-project-12-scaled-2-1536x1024.jpg" alt="DoingRight training session with educators and participants" className="rounded-lg shadow-2xl w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg"></div>
              {/* Overlay with training info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl md:text-2xl font-heading font-bold mb-2"> Real Training in Action </motion.h3>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-sm md:text-base text-neutral-200 leading-relaxed"> DoingRight educators conducting interactive training sessions with students and community members across Nigeria. </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Authentication Notice for Non-Logged Users */}
      {!isAuthenticated && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-container mx-auto px-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Start Your Learning Journey </h2>
                <p className="text-lg text-neutral-700 mb-6 leading-relaxed"> Create a free account to access our comprehensive training courses,track your progress,and earn certificates upon completion. </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login" className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center">
                    Create Free Account
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center justify-center"> Sign In </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Training Approach Section */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Our Training Approach </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed"> Experience authentic DoingRight training through our comprehensive programs that combine classroom learning,community engagement,and practical application of integrity principles. </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Interactive Learning */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686439881-Do-right-awarenss-initiative-school-project-12-scaled-2-1536x1024.jpg" alt="Interactive DoingRight training session" className="w-full h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"> Interactive Learning </div>
              </div>
              <div className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <SafeIcon icon={FiUsers} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3"> Classroom Engagement </h3>
                <p className="text-neutral-700 leading-relaxed"> Our trainers work directly with participants in interactive sessions,fostering discussions about integrity,leadership,and civic responsibility through practical exercises. </p>
              </div>
            </motion.div>
            {/* Resource Distribution */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686560981-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg" alt="DoingRight educational resource distribution" className="w-full h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-medium"> Resource Sharing </div>
              </div>
              <div className="p-6">
                <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <SafeIcon icon={FiBookOpen} className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3"> Educational Materials </h3>
                <p className="text-neutral-700 leading-relaxed"> We provide comprehensive educational materials and resources to support learning,ensuring participants have access to quality content and reference materials. </p>
              </div>
            </motion.div>
            {/* Community Mentorship */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759686583500-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg" alt="DoingRight community mentorship and engagement" className="w-full h-48 object-cover" />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"> Mentorship </div>
              </div>
              <div className="p-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <SafeIcon icon={FiTarget} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3"> Personal Mentorship </h3>
                <p className="text-neutral-700 leading-relaxed"> One-on-one mentorship and guidance from experienced DoingRight educators,helping participants apply integrity principles in their personal and professional lives. </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Courses Section */}
      <section id="courses" className="py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Available Courses </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> Progressive learning path from foundational integrity principles to advanced community leadership and advocacy skills. </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course, index) => {
              const status = isAuthenticated ? getCourseStatus(course) : { isUnlocked: false, isComplete: false, completedLessons: 0, totalLessons: course.lessons.length, isCertified: false };
              return (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${!isAuthenticated || !status.isUnlocked ? 'opacity-80' : ''}`}>
                  <div className="relative">
                    <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 right-4">
                      {!isAuthenticated ? (
                        <div className="bg-neutral-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <SafeIcon icon={FiLock} className="w-4 h-4 mr-1" /> Login Required
                        </div>
                      ) : status.isCertified ? (
                        <div className="bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" /> Certified
                        </div>
                      ) : !status.isUnlocked ? (
                        <div className="bg-neutral-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <SafeIcon icon={FiLock} className="w-4 h-4 mr-1" /> Locked
                        </div>
                      ) : status.completedLessons > 0 ? (
                        <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"> {status.completedLessons}/{status.totalLessons} Complete </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-neutral-600 mb-2"> Course {index + 1} {course.prerequisite && ` • Requires Course ${courses.findIndex(c => c.id === course.prerequisite) + 1}`} </div>
                    <h3 className="text-h3 font-heading font-bold text-neutral-900 mb-3"> {course.title} </h3>
                    <p className="text-neutral-700 mb-4 leading-relaxed"> {course.description} </p>
                    <div className="flex items-center justify-between text-sm text-neutral-600 mb-6">
                      <div className="flex items-center">
                        <SafeIcon icon={FiPlay} className="w-4 h-4 mr-1" /> {course.lessons.length} lessons
                      </div>
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" /> {course.lessons.reduce((total, lesson) => { const [minutes] = lesson.duration.split(':'); return total + parseInt(minutes); }, 0)} min total
                      </div>
                    </div>
                    {!isAuthenticated ? (
                      <Link to="/login" className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center">
                        Sign In to Access
                        <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                      </Link>
                    ) : status.isUnlocked ? (
                      <Link to={`/training/course/${course.id}`} className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center">
                        {status.completedLessons > 0 ? 'Continue Course' : 'Start Course'}
                        <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                      </Link>
                    ) : (
                      <div className="w-full bg-neutral-200 text-neutral-500 px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center cursor-not-allowed">
                        <SafeIcon icon={FiLock} className="mr-2 w-5 h-5" /> Complete Previous Course
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> How It Works </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> Our structured learning approach ensures you build knowledge progressively and earn verified credentials for your achievements. </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SafeIcon icon={step.icon} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3"> {step.title} </h3>
                <p className="text-neutral-700 leading-relaxed"> {step.description} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-h2 font-heading font-bold mb-6"> Ready to Start Learning? </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> Begin your journey toward becoming a certified integrity champion and community leader. </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <a href="#courses" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
                    Browse Courses
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </a>
                  <Link to="/training/dashboard" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> View Dashboard </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
                    Get Started Free
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Sign Up / Login </Link>
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