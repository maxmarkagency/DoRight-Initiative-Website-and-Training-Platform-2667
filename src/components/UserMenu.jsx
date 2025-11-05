import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiSettings, FiLogOut, FiBookOpen, FiAward, FiChevronDown } = FiIcons;

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  // Get user display name from user metadata or email
  const firstName = user.user_metadata?.first_name || user.email.split('@')[0];
  const lastName = user.user_metadata?.last_name || '';
  const displayName = firstName + (lastName ? ` ${lastName}` : '');
  const initials = firstName.charAt(0).toUpperCase() + (lastName ? lastName.charAt(0).toUpperCase() : '');

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
      >
        <div className="bg-accent text-black w-8 h-8 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold">
            {initials}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white">
            {firstName}
          </div>
          <div className="text-xs text-white/70">
            Student
          </div>
        </div>
        <SafeIcon icon={FiChevronDown} className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-neutral-100">
              <div className="font-medium text-neutral-900">
                {displayName}
              </div>
              <div className="text-sm text-neutral-500">{user.email}</div>
            </div>
            {/* Menu Items */}
            <div className="py-1">
              <Link
                to="/training/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <SafeIcon icon={FiBookOpen} className="w-4 h-4 mr-3" />
                Training Dashboard
              </Link>
              <Link
                to="/training"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <SafeIcon icon={FiAward} className="w-4 h-4 mr-3" />
                Browse Courses
              </Link>
              <Link
                to="/training/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <SafeIcon icon={FiSettings} className="w-4 h-4 mr-3" />
                Profile Settings
              </Link>
            </div>
            {/* Logout */}
            <div className="border-t border-neutral-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;