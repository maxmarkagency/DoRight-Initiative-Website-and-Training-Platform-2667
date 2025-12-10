import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useTraining } from '../../context/TrainingContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiBookOpen, FiPlay, FiClock, FiAward } = FiIcons;

const StudentCourses = () => {
  const { loading, error, enrollments } = useTraining();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-white p-8 text-center">
        <SafeIcon icon={FiBookOpen} className="text-5xl text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Courses</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const enrolledCourses = enrollments.map(e => e.courses);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Courses</h1>
        <p className="text-gray-400 text-sm sm:text-base">Track your learning progress and continue your journey</p>
      </motion.div>

      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {enrolledCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <div className="h-40 sm:h-48 bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <SafeIcon icon={FiBookOpen} className="text-4xl sm:text-6xl text-white opacity-80" />
                </div>
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <span className="bg-accent text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {course.difficulty_level}
                  </span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 space-y-1 sm:space-y-0">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiClock} className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.estimated_duration || 120} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiAward} className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Certificate</span>
                  </div>
                </div>

                <Link to={`/course/${course.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-accent text-black font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:brightness-90 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <SafeIcon icon={FiPlay} className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Continue Learning</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 sm:p-12 text-center">
          <SafeIcon icon={FiBookOpen} className="text-4xl sm:text-6xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">No Courses Yet</h3>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Start your learning journey by enrolling in a course</p>
          <Link to="/training">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent text-black font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base"
            >
              Browse Courses
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;