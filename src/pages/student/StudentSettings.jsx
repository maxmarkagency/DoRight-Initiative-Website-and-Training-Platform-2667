import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiBell, FiLock, FiEye, FiSave, FiMail, FiSmartphone } = FiIcons;

const StudentSettings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    courseUpdates: true,
    forumReplies: true,
    newCourses: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
    allowMessages: true
  });

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }

  const handleNotificationChange = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting) => {
    setPrivacy(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences and privacy settings</p>
      </motion.div>

      <div className="space-y-8">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiBell} className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiSmartphone} className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">Browser and mobile notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Course Updates</p>
                <p className="text-sm text-gray-400">New lessons and content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.courseUpdates}
                  onChange={() => handleNotificationChange('courseUpdates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiLock} className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-white">Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Profile Visibility</p>
                <p className="text-sm text-gray-400">Make your profile visible to other students</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={() => handlePrivacyChange('profileVisible')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Progress Sharing</p>
                <p className="text-sm text-gray-400">Show your learning progress to others</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showProgress}
                  onChange={() => handlePrivacyChange('showProgress')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiEye} className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-white">Account Actions</h2>
          </div>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-accent text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>Save Settings</span>
            </motion.button>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Changes are saved automatically. 
                <span className="text-accent ml-1 cursor-pointer hover:underline">Change Password</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentSettings;