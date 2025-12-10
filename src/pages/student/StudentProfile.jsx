import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiCamera } = FiIcons;

const StudentProfile = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.first_name || 'Student';
  const initials = displayName.charAt(0).toUpperCase();

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400 text-sm sm:text-base">Manage your personal information and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-4 sm:p-6 rounded-xl text-center"
          >
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent text-black rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-gray-700 rounded-full text-gray-300 hover:text-white transition-colors">
                <SafeIcon icon={FiCamera} className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">{user?.role || 'Student'}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-accent text-black font-semibold py-2 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <SafeIcon icon={FiEdit} className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Edit Profile</span>
            </motion.button>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-4 sm:p-6 rounded-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Personal Information</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <SafeIcon icon={FiMail} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Email</p>
                  <p className="text-white text-sm sm:text-base break-all">{user?.email || 'student@doright.ng'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <SafeIcon icon={FiUser} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">First Name</p>
                  <p className="text-white text-sm sm:text-base">{user?.user_metadata?.first_name || 'John'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <SafeIcon icon={FiUser} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Last Name</p>
                  <p className="text-white text-sm sm:text-base">{user?.user_metadata?.last_name || 'Doe'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <SafeIcon icon={FiPhone} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Phone</p>
                  <p className="text-white text-sm sm:text-base">Not provided</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">Location</p>
                  <p className="text-white text-sm sm:text-base">Not provided</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;