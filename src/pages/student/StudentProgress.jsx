import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useTraining } from '../../context/TrainingContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiTrendingUp, FiTarget, FiCheckCircle, FiClock } = FiIcons;

const StudentProgress = () => {
  const { loading, error, userProgress } = useTraining();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="text-white p-8 text-center">
        <SafeIcon icon={FiTrendingUp} className="text-5xl text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Progress</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Progress</h1>
        <p className="text-gray-400">Track your learning achievements and milestones</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/20 rounded-full text-accent">
              <SafeIcon icon={FiTarget} className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Overall Progress</p>
              <p className="text-2xl font-bold text-white">{userProgress.overallPercentage}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
              <SafeIcon icon={FiCheckCircle} className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-white">{userProgress.completedLessons}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
              <SafeIcon icon={FiClock} className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-white">{userProgress.inProgressLessons}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
              <SafeIcon icon={FiTrendingUp} className="text-2xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Time</p>
              <p className="text-2xl font-bold text-white">{Math.floor(userProgress.totalTimeSpent / 60)}h</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 p-8 rounded-xl text-center"
      >
        <SafeIcon icon={FiTrendingUp} className="text-6xl text-accent mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">Progress Tracking</h3>
        <p className="text-gray-400 mb-6">
          Detailed progress analytics and learning insights will be displayed here.
        </p>
        <p className="text-sm text-gray-500">
          This feature shows your learning journey, time spent, and achievements.
        </p>
      </motion.div>
    </div>
  );
};

export default StudentProgress;