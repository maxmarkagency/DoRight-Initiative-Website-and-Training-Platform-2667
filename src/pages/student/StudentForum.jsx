import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiMessageSquare, FiUsers, FiClock, FiHeart, FiThumbsUp } = FiIcons;

const StudentForum = () => {
  // Mock forum discussions
  const discussions = [
    {
      id: 1,
      title: 'Best practices for ethical decision making',
      author: 'Sarah M.',
      replies: 12,
      lastActivity: '2 hours ago',
      likes: 8,
      course: 'Foundations of Integrity'
    },
    {
      id: 2,
      title: 'How to handle conflicts in leadership?',
      author: 'Michael R.',
      replies: 5,
      lastActivity: '1 day ago',
      likes: 15,
      course: 'Leadership & Civic Responsibility'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Learning Forum</h1>
        <p className="text-gray-400">Connect with fellow learners and discuss course topics</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {discussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{discussion.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <span>By {discussion.author}</span>
                      <span>•</span>
                      <span>{discussion.course}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiMessageSquare} className="w-4 h-4" />
                        <span>{discussion.replies} replies</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiThumbsUp} className="w-4 h-4" />
                        <span>{discussion.likes} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiClock} className="w-4 h-4" />
                        <span>{discussion.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Forum Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Discussions</span>
                <span className="text-white font-semibold">142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-semibold">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Today</span>
                <span className="text-white font-semibold">23</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Popular Courses</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Foundations of Integrity</div>
              <div className="text-sm text-gray-400">Leadership & Civic Responsibility</div>
              <div className="text-sm text-gray-400">Anti-Corruption Practices</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentForum;